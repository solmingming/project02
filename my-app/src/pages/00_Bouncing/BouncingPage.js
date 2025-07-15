import React, { useRef, useEffect, useState } from 'react';
import Sketch from 'react-p5';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSpring, animated, easings } from 'react-spring';
import BouncingSettings from './BouncingSettings';

// 전역 변수로 p5.js 관련 상태 관리
let font;
let points = [];
let draggingPoint = null;
let selectedPoint = null;
let showSelected = true;
const restoreThreshold = 0.5;
let textStr = "Glitz";

let textX, textY, dynamicFontSize, textBoundsW;
let hitBuffer;

// p5 스케치 외부에서 제어할 설정 객체
let settings = {
  damping: 0.73,
  kValue: 0.3,
  sampleFactor: 0.5,
  textSize: 0.2,
};

// p5 인스턴스를 저장할 전역 변수
let p5Instance = null;
// p5 캔버스가 준비되었는지 확인하는 플래그
let isp5CanvasReady = false;

// 점들을 초기화하는 함수
function initPoints(p5) {
  // p5 캔버스가 준비되지 않았거나 폰트가 로드되지 않았으면 중단
  if (!isp5CanvasReady || !font) return;

  // 윈도우 크기와 textSize 설정에 따라 동적으로 폰트 크기 계산
  dynamicFontSize = p5.windowWidth * settings.textSize;
  const bounds = font.textBounds(textStr, 0, 0, dynamicFontSize);
  textBoundsW = bounds.w;
  textX = (p5.width - bounds.w) / 2 - bounds.x;
  textY = (p5.height - bounds.h) / 2 - bounds.y;

  // 텍스트를 점들로 변환
  points = font.textToPoints(textStr, textX, textY, dynamicFontSize, { sampleFactor: settings.sampleFactor });
  points.forEach(pt => {
    pt.originalX = pt.x;
    pt.originalY = pt.y;
    // 점들의 초기 위치를 무작위로 설정
    pt.x = p5.width / 2 + p5.random(-50, 50);
    pt.y = p5.height / 2 + p5.random(-50, 50);
    pt.vx = p5.random(-5, 5);
    pt.vy = p5.random(-5, 5);
  });
}

const BouncingPage = ({ isSettingsOpen, closeSettings }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const idleTimeout = useRef(null);
  const isIdle = useRef(false);
  const [isZooming, setIsZooming] = useState(false);

  const [appSettings, setAppSettings] = useState({
    topColor: '#85D0FF',
    bottomColor: '#85D0FF',
    damping: 0.73,
    kValue: 0.3,
    sampleFactor: 0.25,
    text: "Glitz",
    textSize: 0.2,
  });

  // 설정 변경 감지 useEffect
  useEffect(() => {
    // p5 인스턴스와 캔버스가 준비되지 않았으면 아무 작업도 하지 않음
    if (!p5Instance || !isp5CanvasReady) return;

    const needsReinit = textStr !== appSettings.text ||
                        settings.sampleFactor !== appSettings.sampleFactor ||
                        settings.textSize !== appSettings.textSize;

    settings.damping = appSettings.damping;
    settings.kValue = appSettings.kValue;
    settings.textSize = appSettings.textSize;
    
    if (needsReinit) {
      textStr = appSettings.text;
      settings.sampleFactor = appSettings.sampleFactor;
      // p5의 루프 안에서 안전하게 초기화를 다시 수행하도록 요청
      p5Instance.loop(); // 혹시 멈췄을 경우를 대비해 루프를 다시 시작
      initPoints(p5Instance);
    }
  }, [appSettings]);


  const handleSettingsChange = (newSettings) => {
    setAppSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleTextChange = (newText) => {
    setAppSettings(prev => ({...prev, text: newText}));
  };

  const handleColorChange = (top, bottom) => {
    setAppSettings(prev => ({ ...prev, topColor: top, bottomColor: bottom }));
  };

  const resetIdleTimer = () => {
    isIdle.current = false;
    clearTimeout(idleTimeout.current);
    idleTimeout.current = setTimeout(() => {
      if (!draggingPoint) {
        isIdle.current = true;
      }
    }, 10000);
  };

  const handleInteraction = () => {
    isIdle.current = false;
    resetIdleTimer();
  };

  useEffect(() => {
    resetIdleTimer();
    // 컴포넌트 언마운트 시 p5 관련 상태 초기화
    return () => {
      clearTimeout(idleTimeout.current);
      p5Instance = null;
      isp5CanvasReady = false;
      points = [];
    };
  }, []);

  // p5: 폰트 미리 로드
  const preload = (p5) => {
    font = p5.loadFont("/assets/fonts/Mungyeong-Gamhong-Apple.otf");
  };

  // p5: 초기 설정
  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    hitBuffer = p5.createGraphics(p5.windowWidth, p5.windowHeight);
    p5Instance = p5; // p5 인스턴스 할당
    isp5CanvasReady = true; // 캔버스가 준비되었음을 명시
    initPoints(p5); // 캔버스와 컨텍스트가 보장된 후 점 초기화
  };

  // p5: 윈도우 크기 변경 시
  const windowResized = (p5) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    if (hitBuffer) {
      hitBuffer.resizeCanvas(p5.windowWidth, p5.windowHeight);
    }
    initPoints(p5);
  };

  // ... (draw, mousePressed, mouseReleased 등 나머지 코드는 동일)
  const draw = (p5) => {
    p5.clear();

    // 마우스 감지를 위한 버퍼
    hitBuffer.clear();
    hitBuffer.textFont(font);
    hitBuffer.textSize(dynamicFontSize);
    hitBuffer.fill(255);
    hitBuffer.noStroke();
    hitBuffer.text(textStr, textX, textY);

    p5.noStroke();

    const k = settings.kValue;
    const damping = settings.damping;

    let dx = 0, dy = 0;
    if (draggingPoint) {
      dx = draggingPoint.x - draggingPoint.originalX;
      dy = draggingPoint.y - draggingPoint.originalY;
    }

    // 물리 시뮬레이션
    for (let pt of points) {
      let fx = (pt.originalX - pt.x) * k;
      let fy = (pt.originalY - pt.y) * k;
      if (draggingPoint) {
        const influenceRadius = textBoundsW;
        const d0 = p5.dist(
          pt.originalX, pt.originalY,
          draggingPoint.originalX, draggingPoint.originalY
        );
        if (d0 < influenceRadius) {
          const w = 1 - d0 / influenceRadius;
          fx += dx * w * 0.15;
          fy += dy * w * 0.15;
        }
      }

      if (isIdle.current && !draggingPoint) {
        const t = p5.frameCount * 0.02;
        const amplitude = 1.3;
        const frequency = 0.07;
        fx += Math.sin(t + pt.originalX * frequency) * amplitude;
        fy += Math.cos(t + pt.originalY * frequency) * amplitude;
      }

      pt.vx = (pt.vx + fx) * damping;
      pt.vy = (pt.vy + fy) * damping;
      pt.x += pt.vx;
      pt.y += pt.vy;
    }

    if (!draggingPoint && selectedPoint && !showSelected) {
      const allRestored = points.every(pt =>
        pt === selectedPoint || (
          Math.abs(pt.x - pt.originalX) < restoreThreshold &&
          Math.abs(pt.y - pt.originalY) < restoreThreshold
        )
      );
      if (allRestored) showSelected = true;
    }

    p5.fill("#FFFFFF");
    for (let pt of points) {
      if (pt === draggingPoint) continue;
      if (pt === selectedPoint && !showSelected) continue;
      p5.circle(pt.x, pt.y, 10);
    }

    if (draggingPoint) {
      draggingPoint.x = p5.mouseX;
      draggingPoint.y = p5.mouseY;
    }
  };

  const mousePressed = (p5) => {
    if (isSettingsOpen || isZooming) return;

    const c = hitBuffer.get(p5.mouseX, p5.mouseY);
    if (c[3] > 0) { // 텍스트 영역 클릭 감지
      let closestDist = Infinity;
      let closestPoint = null;
      for (let pt of points) {
        const d = p5.dist(p5.mouseX, p5.mouseY, pt.x, pt.y);
        if (d < closestDist) {
          handleInteraction();
          closestDist = d;
          closestPoint = pt;
        }
      }

      if (closestPoint) {
        selectedPoint = closestPoint;
        showSelected = false;
        draggingPoint = closestPoint;
      }
    }
  };

  const mouseReleased = () => {
    if(!draggingPoint) return;
    handleInteraction();
    draggingPoint = null;
  };
  // ... (나머지 JSX 부분은 동일)
  const handleStartClick = () => {
    if(isSettingsOpen) return;
    setIsZooming(true);
  };

  const { scale } = useSpring({
    scale: isZooming ? 50 : 1,
    config: {
      duration: 1700,
      easing: easings.easeInExpo,
    },
  });

  const backgroundColor = scale.to(
    [1, 5, 15],
    ['transparent', 'transparent', '#FFFFFF']
  );

  const sketchOpacity = scale.to([1, 5, 15], [1, 1, 0]);

  const menuAnimation = useSpring({
    opacity: isZooming ? 1 : 0,
    transform: isZooming ? 'translateY(0px)' : 'translateY(50px)',
    config: { tension: 120, friction: 30 },
    delay: isZooming ? 2300 : 0,
  });

  const PageSelectionMenu = () => (
    <animated.div
      style={{
        ...menuAnimation,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        zIndex: 20,
      }}
    >
      <h2 style={{ color: 'white', fontFamily: "'Mungyeong-Gamhong-Apple', sans-serif", fontSize: '3rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
        어디로 가볼까요?
      </h2>
      <div style={{ marginTop: '2rem' }}>
        <button onClick={() => navigate('/wipe')} className="menu-button">Wipe</button>
        <button onClick={() => navigate('/grass-art')} className="menu-button">Grass Art</button>
        <button onClick={() => navigate('/river')} className="menu-button">River</button>
      </div>
    </animated.div>
  );
  
  return (
    <div style={{
        position: 'relative',
        height: '100vh',
        overflow: 'hidden',
        background: `linear-gradient(to bottom, ${appSettings.topColor}, ${appSettings.bottomColor})`,
    }}>
      <animated.div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '100%',
          backgroundColor: backgroundColor,
      }}>
          <animated.div style={{
              height: '100%',
              width: '100%',
              transform: scale.to(s => `scale(${s})`),
              opacity: sketchOpacity
          }}>
            <Sketch
              preload={preload}
              setup={setup}
              draw={draw}
              windowResized={windowResized}
              mousePressed={mousePressed}
              mouseReleased={mouseReleased}
            />
          </animated.div>
      </animated.div>

      {location.pathname !== '/bouncing' && !isZooming && (
        <button
          onClick={handleStartClick}
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 28px',
            fontSize: '1.5rem',
            fontFamily: "'Mungyeong-Gamhong-Apple', sans-serif",
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            border: '2px solid rgba(255, 255, 255, 0.8)',
            borderRadius: '50px',
            cursor: 'pointer',
            zIndex: 10,
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.2s ease-in-out',
          }}
        >
          시작하기
        </button>
      )}
      {isZooming && <PageSelectionMenu />}
      <style>{`
        .menu-button {
          margin: 0 15px;
          padding: 15px 35px;
          font-size: 1.8rem;
          font-family: 'Mungyeong-Gamhong-Apple', sans-serif;
          color: white;
          background-color: rgba(0, 0, 0, 0.3);
          border: 2px solid rgba(255, 255, 255, 0.9);
          border-radius: 50px;
          cursor: pointer;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
        }
        .menu-button:hover {
          background-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-5px);
        }
      `}</style>

      <BouncingSettings
        isOpen={isSettingsOpen}
        onClose={closeSettings}
        initialSettings={appSettings}
        onColorChange={handleColorChange}
        onSettingsChange={handleSettingsChange}
        onTextChange={handleTextChange}
      />
    </div>
  );
};

export default BouncingPage;