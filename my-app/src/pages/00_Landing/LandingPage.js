import React, { useRef, useEffect, useState } from 'react';
import Sketch from 'react-p5';
import { useNavigate } from 'react-router-dom';
// easings를 import합니다.
import { useSpring, animated, easings } from 'react-spring';

let font;
let points = [];
let draggingPoint = null;
let selectedPoint = null;
let showSelected = true;
const restoreThreshold = 0.5;
const textStr = "Glitz";

let textX, textY, dynamicFontSize;
let hitBuffer;

function initPoints(p5) {
  dynamicFontSize = p5.windowWidth * 0.2;
  const bounds = font.textBounds(textStr, 0, 0, dynamicFontSize);
  textX = (p5.width - bounds.w) / 2 - bounds.x;
  textY = (p5.height - bounds.h) / 2 - bounds.y;

  points = font.textToPoints(textStr, textX, textY, dynamicFontSize, { sampleFactor: 1.0 });
  points.forEach(pt => {
    pt.originalX = pt.x;
    pt.originalY = pt.y;
    pt.x = p5.width / 2 + p5.random(-50, 50);
    pt.y = p5.height / 2 + p5.random(-50, 50);
    pt.vx = p5.random(-5, 5);
    pt.vy = p5.random(-5, 5);
  });
}

export default function LandingPage() {
  const navigate = useNavigate();
  const idleTimeout = useRef(null);
  const isIdle = useRef(false);
  const [isZooming, setIsZooming] = useState(false);

  const resetIdleTimer = () => {
    isIdle.current = false;
    clearTimeout(idleTimeout.current);
    idleTimeout.current = setTimeout(() => {
      if (!draggingPoint) {
        isIdle.current = true;
      }
    }, 3000);
  };

  const handleInteraction = () => {
    isIdle.current = false;
    resetIdleTimer();
  };

  useEffect(() => {
    resetIdleTimer();
    return () => clearTimeout(idleTimeout.current);
  }, []);

  const preload = (p5) => {
    font = p5.loadFont("/assets/fonts/Mungyeong-Gamhong-Apple.otf");
  };

  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    hitBuffer = p5.createGraphics(p5.windowWidth, p5.windowHeight);
    initPoints(p5);
  };

  const windowResized = (p5) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    if (hitBuffer)
      hitBuffer.resize(p5.windowWidth, p5.windowHeight);
    initPoints(p5);
  };

  const draw = (p5) => {
    p5.clear();

    hitBuffer.clear();
    hitBuffer.textFont(font);
    hitBuffer.textSize(dynamicFontSize);
    hitBuffer.fill(255);
    hitBuffer.noStroke();
    hitBuffer.text(textStr, textX, textY);

    p5.noStroke();

    const k = 0.3;
    const damping = 0.73;
    let dx = 0, dy = 0;
    if (draggingPoint) {
      dx = draggingPoint.x - draggingPoint.originalX;
      dy = draggingPoint.y - draggingPoint.originalY;
    }

    for (let pt of points) {
      let fx = (pt.originalX - pt.x) * k;
      let fy = (pt.originalY - pt.y) * k;
      if (draggingPoint) {
        const influenceRadius = 800;
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
        const amplitude = 0.8;
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
    handleInteraction();
    if (isZooming) return;

    const c = hitBuffer.get(p5.mouseX, p5.mouseY);
    if (c[3] > 0) {
      let closestDist = Infinity;
      let closestPoint = null;
      for (let pt of points) {
        const d = p5.dist(p5.mouseX, p5.mouseY, pt.x, pt.y);
        if (d < closestDist) {
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
    handleInteraction();
    draggingPoint = null;
  };

  const mouseMoved = () => {
    handleInteraction();
  }

  const handleStartClick = () => {
    setIsZooming(true);
  };

  // --- Start of Animation Logic Changes ---

  const { scale } = useSpring({
    scale: isZooming ? 50 : 1,
    config: {
      // 전체 애니메이션 시간을 4초로 설정
      duration: 1700,
      // '시작은 느리고 갈수록 빨라지는' 효과를 위해 easeInCubic 사용
      easing: easings.easeInExpo,
    },
  });

  // easeIn 곡선에 맞춰 White Out 시점을 재조정합니다.
  // scale 값이 20에 도달할 때까지 원래 색을 유지하다가, 40까지 흰색으로 변합니다.
  const backgroundColor = scale.to(
    [1, 5, 15],
    ['#85D0FF', '#85D0FF', '#FFFFFF']
  );

  // 글씨가 사라지는 시점도 재조정합니다.
  // scale 값이 15에 도달할 때까지 보이다가, 35까지 점차 투명해집니다.
  const sketchOpacity = scale.to([1, 5, 15], [1, 1, 0]);

  // --- End of Animation Logic Changes ---

  const menuAnimation = useSpring({
    opacity: isZooming ? 1 : 0,
    transform: isZooming ? 'translateY(0px)' : 'translateY(50px)',
    config: { tension: 120, friction: 30 },
    // 메뉴 등장 딜레이를 애니메이션 후반부로 조정
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
    <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
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
              mouseMoved={mouseMoved}
            />
          </animated.div>
      </animated.div>

      {!isZooming && (
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
    </div>
  );
}