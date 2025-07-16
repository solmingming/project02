// src/pages/02_GrassArtCanvas/GrassArt.js

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sketch from 'react-p5';
import GrassSettings from './GrassSettings';
import { getLatestGrass, getGrassSettingsByEmail, saveGrassSettings } from '../../api';
import { useAuth } from '../../AuthContext';

let leafImage;
let overlayImage;

const deltaConst = 1;

const defaultSettings = {
  topColor: '#BBFFD9',
  bottomColor: '#D6EFFF',
  text: "Glitz",
};

export default function GrassArt({ isSettingsOpen, closeSettings }) {
  const [shapes, setShapes] = useState([]);
  const [isP5Setup, setIsP5Setup] = useState(false);
  
  const { user, loading: authLoading } = useAuth();
  const [appSettings, setAppSettings] = useState(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  const imageAspectRatio = useRef(1);
  const appSettingsRef = useRef(appSettings);
  const virtualScrollY = useRef(0);
  const deltaRGB = useRef({ r: 0, g: 0, b: 0 });

  const leafOffsets = useRef({});
  const leafVelocities = useRef({});
  const waterPoints = useRef([]);
  const textWaves = useRef([]);
  const usedShapes = useRef(new Set());
  const activeFlowers = useRef({});

  const canvasW = useRef(window.innerWidth);
  const canvasH = useRef(window.innerHeight);

  const waterSounds = [
    '/assets/music/water_sound1.mp3',
    '/assets/music/water_sound2.mp3',
    '/assets/music/water_sound3.mp3',
    '/assets/music/water_sound4.mp3'
  ];

  useEffect(() => {
    if (authLoading) return;

    const fetchInitialSettings = async () => {
        setIsLoading(true);
        let dataFromDB = null;

        if (user) {
            dataFromDB = await getGrassSettingsByEmail(user.email);
        }

        if (!dataFromDB) {
            dataFromDB = await getLatestGrass();
        }

        if (dataFromDB) {
            setAppSettings(prev => ({ ...prev, ...dataFromDB }));
        }

        setIsLoading(false);
    };
    fetchInitialSettings();
  }, [user, authLoading]);

  const handleSettingsUpdate = useCallback((newSettings) => {
      const updatedSettings = { ...appSettings, ...newSettings };
      setAppSettings(updatedSettings);

      if (user) {
          saveGrassSettings({ ...updatedSettings, email: user.email });
      }
  }, [user, appSettings]);

  const handleColorChange = (top, bottom) => {
      handleSettingsUpdate({ topColor: top, bottomColor: bottom });
  };
  
  const handleTextChange = (newText) => {
      handleSettingsUpdate({ text: newText });
  };

  useEffect(() => {
    appSettingsRef.current = appSettings;
  }, [appSettings]);

  useEffect(() => {
    virtualScrollY.current = 0;
    return () => {
      leafOffsets.current = {};
      leafVelocities.current = {};
      waterPoints.current = [];
      textWaves.current = [];
      usedShapes.current = new Set();
      activeFlowers.current = {};
    };
  }, []);

  useEffect(() => {
    const unmute = () => {
      const bgm = document.getElementById('bgm');
      if (bgm) { bgm.muted = false; bgm.play().catch(e=>console.error("Audio play error:", e)); }
      window.removeEventListener('click', unmute);
    };
    window.addEventListener('click', unmute);
    return () => window.removeEventListener('click', unmute);
  }, []);

  useEffect(() => {
    if (!isP5Setup) return;

    const p5 = new window.p5();

    const Top = p5.color(appSettings.topColor);
    const Bottom = p5.color(appSettings.bottomColor);

    deltaRGB.current.r = Bottom.levels[0] - Top.levels[0];
    deltaRGB.current.g = Bottom.levels[1] - Top.levels[1];
    deltaRGB.current.b = Bottom.levels[2] - Top.levels[2];

    p5.remove();

  }, [isP5Setup, appSettings.topColor, appSettings.bottomColor]);

  useEffect(() => {
    if (!isP5Setup) return;
    const textToUse = appSettings.text || "Glitz";
    const count = textToUse.length;
    const colors = ['#67B473', '#599C63', '#69C377'];
    const newShapes = [];
    const baseY = 0.5, offsetY = 0.1, yJitter = 0.015;
    const maxW = 0.2, minW = 0.08;
    const clamped = Math.min(Math.max(count, 4), 20);
    const wRatio = maxW - ((clamped - 4) / (20 - 4)) * (maxW - minW);
    const spacing = 1 / (count || 1), safeMargin = wRatio / 2;
    for (let i = 0; i < count; i++) {
      let x = spacing * i + spacing / 2;
      x += (Math.random() * 2 - 1) * Math.min(spacing / 2 - safeMargin, 0.015);
      x = Math.max(safeMargin, Math.min(1 - safeMargin, x));
      const zigY = baseY + (i % 2 ? offsetY : -offsetY);
      const y = zigY + (Math.random() * 2 - 1) * yJitter;
      newShapes.push({ xRatio: x, yRatio: y, wRatio, color: colors[Math.floor(Math.random() * colors.length)] });
    }

    leafOffsets.current = {};
    leafVelocities.current = {};
    waterPoints.current = [];
    textWaves.current = [];
    usedShapes.current = new Set();
    activeFlowers.current = {};
    setShapes(newShapes);

  }, [appSettings.text, isP5Setup]);

  const preload = p5 => {
    leafImage = p5.loadImage('/assets/images/grass.svg');
    overlayImage = p5.loadImage('/assets/images/MainFlower.png');
  };

  const setupCanvas = (p5, parentRef) => {
    canvasW.current = p5.windowWidth;
    canvasH.current = p5.windowHeight;
    p5.createCanvas(canvasW.current, canvasH.current).parent(parentRef);
    p5.noStroke();
    p5.textFont("JollyLodger, sans-serif");
    if (leafImage?.width) imageAspectRatio.current = leafImage.width / leafImage.height;

    setIsP5Setup(true);
  };

  const windowResized = p5 => {
    canvasW.current = p5.windowWidth;
    canvasH.current = p5.windowHeight;
    p5.resizeCanvas(canvasW.current, canvasH.current);
  };

  const mousePressed = p5 => {

    for (let i = 0; i < shapes.length; i++) {
      const s = shapes[i];
      const bx = s.xRatio * canvasW.current;
      const by = s.yRatio * canvasH.current;
      const w = s.wRatio * canvasW.current;
      const h = w / imageAspectRatio.current;
      const dx = p5.mouseX - bx;
      const dy = p5.mouseY - by;

      if ((dx * dx) / (w * w / 4) + (dy * dy) / (h * h / 4) <= 1) {

        if (activeFlowers.current[i]) {
          const flowerYPos = by - h / 3;
          const flowerHeight = h * 1.3;

          if (p5.mouseX > bx - w / 2 && p5.mouseX < bx + w / 2 &&
            p5.mouseY > flowerYPos - flowerHeight / 2 && p5.mouseY < flowerYPos + flowerHeight / 2) {
          } else {
            delete activeFlowers.current[i];
          }
        } else if (usedShapes.current.has(i)) {
          usedShapes.current.delete(i);
          textWaves.current = textWaves.current.filter(wave => wave.shapeIdx !== i);
        } else {
          if (Math.random() < 0.03) {
            activeFlowers.current[i] = { type: 1, startFrame: p5.frameCount };
          } else {
            usedShapes.current.add(i);
            textWaves.current.push({ shapeIdx: i, letterIdx: i, startFrame: p5.frameCount });
          }
        }

        const waterSound = new Audio(waterSounds[Math.floor(Math.random() * waterSounds.length)]);
        waterSound.volume = 0.5;
        waterSound.play();
        leafOffsets.current[i] = 20;
        leafVelocities.current[i] = 0;
        waterPoints.current.push({
          x: bx, y: by + h / 4, startFrame: p5.frameCount, maxAge: 90, ripples: [
            { delay: 0, maxRadius: p5.random(240, 700), speed: p5.random(0.8, 1.0) },
            { delay: 20, maxRadius: p5.random(200, 260), speed: p5.random(0.6, 0.9) },
            { delay: 40, maxRadius: p5.random(80, 140), speed: p5.random(0.4, 0.7) }
          ]
        });

        break;
      }
    }

  };

  const mouseDragged = p5 => {
    const deltaY = (p5.mouseY - p5.pmouseY) * deltaConst;
    const newScrollY = virtualScrollY.current - deltaY;
    virtualScrollY.current = newScrollY;
  };

  const draw = p5 => {
    const currentScrollY = virtualScrollY.current;

    p5.clear();
    p5.noStroke();
    p5.colorMode(p5.RGB, 255);

    const progress = currentScrollY / canvasH.current;
    const curTop = p5.color(appSettingsRef.current.topColor);
    const curBot = p5.color(appSettingsRef.current.bottomColor);

    let TopR = (curTop.levels[0] + deltaRGB.current.r * progress + 512) % 512;
    let TopG = (curTop.levels[1] + deltaRGB.current.g * progress + 512) % 512;
    let TopB = (curTop.levels[2] + deltaRGB.current.b * progress + 512) % 512;
    let BottomR = (curBot.levels[0] + deltaRGB.current.r * progress + 512) % 512;
    let BottomG = (curBot.levels[1] + deltaRGB.current.g * progress + 512) % 512;
    let BottomB = (curBot.levels[2] + deltaRGB.current.b * progress + 512) % 512;

    TopR = TopR >= 256 ? 512 - TopR : TopR;
    TopG = TopG >= 256 ? 512 - TopG : TopG;
    TopB = TopB >= 256 ? 512 - TopB : TopB;
    BottomR = BottomR >= 256 ? 512 - BottomR : BottomR;
    BottomG = BottomG >= 256 ? 512 - BottomG : BottomG;
    BottomB = BottomB >= 256 ? 512 - BottomB : BottomB;

    const top = p5.color(TopR, TopG, TopB);
    const bottom = p5.color(BottomR, BottomG, BottomB);

    for (let y = 0; y < canvasH.current; y++) {
      const inter = p5.map(y, 0, canvasH.current, 0, 1);
      const c = p5.lerpColor(top, bottom, inter);
      p5.stroke(c);
      p5.line(0, y, canvasW.current, y);
    }
    p5.noStroke();

    p5.push();

    waterPoints.current = waterPoints.current.filter(g => p5.frameCount - g.startFrame < g.maxAge);
    waterPoints.current.forEach(g => {
      const age = p5.frameCount - g.startFrame;
      g.ripples.forEach(r => {
        if (age > r.delay) {
          const rad = (age - r.delay) * r.speed;
          if (rad < r.maxRadius) {
            const alpha = Math.sin((rad / r.maxRadius) * Math.PI) * 255;
            p5.noFill(); p5.stroke(255, 255, 255, alpha); p5.strokeWeight(8);
            p5.ellipse(g.x, g.y, rad * 5, rad * 3);
          }
        }
      });
    });
    p5.noStroke();

    shapes.forEach((s, i) => {
      const bx = s.xRatio * canvasW.current;
      const by = s.yRatio * canvasH.current;
      const w = s.wRatio * canvasW.current;
      const h = w / imageAspectRatio.current;
      let bOff = leafOffsets.current[i] || 0;
      let bVel = leafVelocities.current[i] || 0;
      if (bOff || bVel) {
        bVel += -0.2 * bOff; bVel *= 0.75; bOff += bVel;
        if (Math.abs(bOff) < 0.5 && Math.abs(bVel) < 0.5) bOff = bVel = 0;
        leafOffsets.current[i] = bOff; leafVelocities.current[i] = bVel;
      }
      const yPos = by + bOff;

      p5.push();
      p5.imageMode(p5.CENTER);
      p5.tint(s.color);
      p5.image(leafImage, bx, yPos, w, h);
      p5.pop();

      const flowerInfo = activeFlowers.current[i];
      if (flowerInfo) {
        const flowerImg = overlayImage;
        const elapsed = p5.frameCount - flowerInfo.startFrame;
        const prog = Math.min(elapsed / 45, 1);
        const alpha = (1 - Math.pow(1 - prog, 3)) * 255;
        const scale = prog;

        p5.push();
        p5.imageMode(p5.CENTER);
        p5.translate(bx, yPos - h / 3);
        p5.scale(scale);
        p5.tint(255, alpha);
        p5.image(flowerImg, 0, 0, w, h * 1.3);
        p5.pop();
      }

      textWaves.current.forEach(evt => {
        if (evt.shapeIdx !== i) return;
        const textToUse = appSettingsRef.current.text || "Glitz";
        const letter = textToUse[evt.letterIdx]; if (!letter) return;
        const elapsed = p5.frameCount - evt.startFrame;
        const prog = Math.min(elapsed / 45, 1);
        const alpha = (1 - Math.pow(1 - prog, 3)) * 255;
        const txtSize = h * 2.5;
        const leafTop = yPos - h / 2;
        const tx = bx;
        const ty = leafTop - txtSize / 2 + h * 0.6;
        p5.push();
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.textSize(txtSize);
        const ctx = p5.drawingContext;
        ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2; ctx.shadowBlur = 4;
        ctx.shadowColor = `rgba(195,240,255,${alpha / 255 * 0.6})`;
        p5.fill(0, 95, 36, alpha);
        p5.text(letter, tx, ty);
        p5.pop();
      });
    });

    p5.pop();
  };

  if (isLoading || authLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1c1c1c' }}>
        <p style={{ color: 'white', fontSize: '2rem', fontFamily: 'sans-serif' }}>Loading Settings...</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <style>{`
        @font-face {
            font-family: 'JollyLodger';
            src: url('/assets/fonts/JollyLodger-Regular.ttf') format('truetype');
        }
      `}</style>

      <audio id="bgm" src="/assets/music/canvas02_back.mp3" loop muted style={{ display: 'none' }} />

      <div style={{ position: 'fixed', top: 0, left: 0, zIndex: -1 }}>
        <Sketch
          preload={preload}
          setup={setupCanvas}
          draw={draw}
          windowResized={windowResized}
          mousePressed={mousePressed}
          mouseDragged={mouseDragged}
        />
      </div>

      <GrassSettings
        isOpen={isSettingsOpen}
        onClose={closeSettings}
        initialSettings={appSettings}
        onColorChange={handleColorChange}
        onTextChange={handleTextChange}
      />
    </div>
  );
}