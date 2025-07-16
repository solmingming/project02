// src/pages/04_Universe/UniversePage.js

import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import io from 'socket.io-client';
import './UniversePage.css';

const SOCKET_SERVER_URL = process.env.REACT_APP_API_URL;

const UniversePage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [stageScale, setStageScale] = useState(1.5);
  const [lines, setLines] = useState([]);
  const [userColor, setUserColor] = useState('#000000');
  const [remainingLength, setRemainingLength] = useState(1000);

  const isDrawing = useRef(false);
  const isPanning = useRef(false);
  const lastPanPoint = useRef({ x: 0, y: 0 });
  const socket = useRef(null);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      alert('이 공간은 로그인이 필요합니다!');
      navigate('/');
      return;
    }

    socket.current = io(SOCKET_SERVER_URL);

    socket.current.emit('user_login', { userId: user.googleId });

    socket.current.on('initial_data', (data) => {
      setLines(data.lines);
      setUserColor(data.userColor);
      setRemainingLength(data.remainingLength);
    });

    socket.current.on('new_line', (newLine) => {
      setLines((prevLines) => [...prevLines, newLine]);
    });

    const container = containerRef.current;
    const handleContextMenu = (e) => e.preventDefault();
    if (container) {
        container.addEventListener('contextmenu', handleContextMenu);
    }

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
      if(container) {
          container.removeEventListener('contextmenu', handleContextMenu);
      }
    };
  }, [user, loading, navigate]);

  const getRelativePointerPosition = () => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };

    const pointer = stage.getPointerPosition();
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    return transform.point(pointer);
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    setStageScale(newScale);

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    setStagePos(newPos);
  };
  
  const handleMouseDown = (e) => {
    const evt = e.evt;
    
    if (evt.button === 0) {
      if (remainingLength <= 0) {
        alert("오늘 그릴 수 있는 양을 모두 사용했습니다.");
        return;
      }
      isDrawing.current = true;
      const pos = getRelativePointerPosition();
      setLines([...lines, { tool: 'pen', points: [pos.x, pos.y], color: userColor }]);

    } else if (evt.button === 1 || evt.button === 2) {
      isPanning.current = true;
      lastPanPoint.current = stageRef.current.getPointerPosition();
    }
  };

  const handleMouseMove = (e) => {
    if (isDrawing.current) {
      const point = getRelativePointerPosition();
      let lastLine = lines[lines.length - 1];

      const prevPoints = lastLine.points;
      const prevX = prevPoints[prevPoints.length - 2];
      const prevY = prevPoints[prevPoints.length - 1];
      const dist = Math.sqrt(Math.pow(point.x - prevX, 2) + Math.pow(point.y - prevY, 2));

      if (remainingLength - dist < 0) {
        handleMouseUp();
        alert("오늘 그릴 수 있는 양을 모두 사용했습니다.");
        return;
      }

      lastLine.points = lastLine.points.concat([point.x, point.y]);
      setLines(lines.slice());
      setRemainingLength(prev => prev - dist);
    }

    if (isPanning.current) {
      const stage = stageRef.current;
      const point = stage.getPointerPosition();
      const dx = point.x - lastPanPoint.current.x;
      const dy = point.y - lastPanPoint.current.y;
      setStagePos({
        x: stagePos.x + dx,
        y: stagePos.y + dy,
      });
      lastPanPoint.current = point;
    }
  };

  const handleMouseUp = () => {
    if (isDrawing.current) {
      const lastLine = lines[lines.length - 1];
      if (lastLine && lastLine.points.length > 4) {
          socket.current.emit('draw_line', lastLine);
      }
    }
    isDrawing.current = false;
    isPanning.current = false;
  };
  
  if (loading) {
    return (
        <div className="universe-container">
            <div className="loading-message">사용자 정보를 확인하는 중...</div>
        </div>
    );
  }

  return (
    <div className="universe-container" ref={containerRef}>
      <div className="remaining-length-display">
        남은 양: {Math.round(remainingLength)}px
      </div>

      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePos.x}
        y={stagePos.y}
      >
        <Layer>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.color}
              strokeWidth={2}
              tension={0.5}
              lineCap="round"
              listening={false}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default UniversePage;