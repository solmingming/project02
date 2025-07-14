import React, { useRef, useEffect } from 'react';
import Sketch from 'react-p5';
import { useNavigate } from 'react-router-dom';

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
    // Start points from the center with a random offset for a "burst" effect
    pt.x = p5.width / 2 + p5.random(-50, 50);
    pt.y = p5.height / 2 + p5.random(-50, 50);
    pt.vx = p5.random(-5, 5); // Give them some initial velocity
    pt.vy = p5.random(-5, 5);
  });
}

export default function LandingPage() {
  const navigate = useNavigate();
  const idleTimeout = useRef(null);
  const isIdle = useRef(false);

  const resetIdleTimer = () => {
    isIdle.current = false;
    clearTimeout(idleTimeout.current);
    idleTimeout.current = setTimeout(() => {
      if (!draggingPoint) { // Don't start idle animation if user is still dragging
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
    hitBuffer.resize(p5.windowWidth, p5.windowHeight);
    initPoints(p5);
  };

  const draw = (p5) => {
    // Update hit buffer for collision detection
    hitBuffer.clear();
    hitBuffer.textFont(font);
    hitBuffer.textSize(dynamicFontSize);
    hitBuffer.fill(255);
    hitBuffer.noStroke();
    hitBuffer.text(textStr, textX, textY);
    
    p5.background("#85D0FF");
    p5.noStroke();

    const k = 0.1;
    const damping = 0.84;
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

      // Add idle animation force when not dragging
      if (isIdle.current && !draggingPoint) {
        const t = p5.frameCount * 0.02;
        const amplitude = 0.8; // Reverted to previous value
        const frequency = 0.07; // Reverted to previous value
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
    
    const c = hitBuffer.get(p5.mouseX, p5.mouseY);
    if (c[3] > 0) { // Check if the click is inside the text shape (alpha > 0)
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
    // Removed navigation logic from here
  };

  const mouseMoved = () => {
    handleInteraction();
  }

  return (
    <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      <Sketch
        preload={preload}
        setup={setup}
        draw={draw}
        windowResized={windowResized}
        mousePressed={mousePressed}
        mouseReleased={mouseReleased}
        mouseMoved={mouseMoved}
      />
      <button
        onClick={() => navigate('/grass-art')}
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
    </div>
  );
} 