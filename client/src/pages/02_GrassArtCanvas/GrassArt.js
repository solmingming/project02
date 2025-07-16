import React, { useState, useEffect, useRef } from 'react';
import Sketch from 'react-p5';
<<<<<<< HEAD
import GrassSettings from './GrassSettings';
import FlowerPage from './FlowerPage';

let leafImage;
let overlayImage;

const deltaConst = 1;

export default function GrassArt({ isSettingsOpen, closeSettings }) {
  const [showFlowerPage, setShowFlowerPage] = useState(false);
  const [shapes, setShapes] = useState([]);
  const [isP5Setup, setIsP5Setup] = useState(false);
  const imageAspectRatio = useRef(1);
  const [appSettings, setAppSettings] = useState({
    topColor: '#BBFFD9',
    bottomColor: '#D6EFFF',
    text: "Glitz",
  });

  const appSettingsRef = useRef(appSettings);
  const virtualScrollY = useRef(0);
  const deltaRGB = useRef({ r: 0, g: 0, b: 0 });

  const leafOffsets = useRef({});
  const leafVelocities = useRef({});
  const waterPoints = useRef([]);
  const textWaves = useRef([]);
  const usedShapes = useRef(new Set());
  const activeFlowers = useRef({});
=======
import { useNavigate } from 'react-router-dom';

const smoothScrollBy = (top, duration) => {
  const startY = window.scrollY;
  const targetY = startY + top;
  const distance = targetY - startY;
  let startTime = null;

  const animation = (currentTime) => {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    // Using an ease-in-out function for smoother start and end
    const progress = Math.min(timeElapsed / duration, 1);
    const ease = 0.5 * (1 - Math.cos(Math.PI * progress));

    window.scrollTo(0, startY + distance * ease);

    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  };

  requestAnimationFrame(animation);
};

let leafImage;
let customFont;
let overlayImage;
let overlayImage2;

export default function GrassArt() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [shapes, setShapes] = useState([]);
  const [isP5Setup, setIsP5Setup] = useState(false);
  const [clicks, setClicks] = useState(0);
  const imageAspectRatio = useRef(1);

  const leafOffsets    = useRef({});
  const leafVelocities = useRef({});
  const dropOffsets    = useRef({});
  const dropVelocities = useRef({});
  const waterPoints    = useRef([]);
  const clickCount     = useRef(0);
  const textWaves      = useRef([]);
  const usedShapes     = useRef(new Set());
  const hasScrolled    = useRef(false);
  const flowerFlags    = useRef({});
>>>>>>> origin/solmin5

  const canvasW = useRef(window.innerWidth);
  const canvasH = useRef(window.innerHeight);

  const waterSounds = [
    '/assets/music/water_sound1.mp3',
    '/assets/music/water_sound2.mp3',
    '/assets/music/water_sound3.mp3',
    '/assets/music/water_sound4.mp3'
  ];

<<<<<<< HEAD
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

=======
  // Ensure page loads at top
  useEffect(() => {
    window.scrollTo(0, 0);

    return () => {
      // Reset all refs when component unmounts
      leafOffsets.current    = {};
      leafVelocities.current = {};
      dropOffsets.current    = {};
      dropVelocities.current = {};
      waterPoints.current    = [];
      clickCount.current     = 0;
      textWaves.current      = [];
      usedShapes.current     = new Set();
      hasScrolled.current    = false;
      flowerFlags.current    = {};
    };
  }, []);

  // Unmute BGM on first click
>>>>>>> origin/solmin5
  useEffect(() => {
    const unmute = () => {
      const bgm = document.getElementById('bgm');
      if (bgm) { bgm.muted = false; bgm.play(); }
      window.removeEventListener('click', unmute);
    };
    window.addEventListener('click', unmute);
    return () => window.removeEventListener('click', unmute);
  }, []);

<<<<<<< HEAD
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
    const count = appSettings.text.length;
=======
  // Place leaves when text changes
  useEffect(() => {
    if (!isP5Setup) return;
    const count = text.length;
>>>>>>> origin/solmin5
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

<<<<<<< HEAD
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

  const handleTextChange = (newText) => {
    setAppSettings(prev => ({ ...prev, text: newText }));
  };

  const handleColorChange = (top, bottom) => {
    setAppSettings(prev => ({ ...prev, topColor: top, bottomColor: bottom }));
=======
    // Reset states
    leafOffsets.current = {};
    leafVelocities.current = {};
    waterPoints.current = [];
    clickCount.current = 0;
    textWaves.current = [];
    usedShapes.current = new Set();
    flowerFlags.current = {};
    setClicks(0);

    // Set shapes and init drops if already scrolled
    setShapes(newShapes);
    if (hasScrolled.current) {
      newShapes.forEach((_, i) => {
        dropOffsets.current[i] = -canvasH.current;
        dropVelocities.current[i] = 0;
        flowerFlags.current[i] = Math.random() < 0.2 ? (Math.floor(Math.random() * 2) + 1) : 0;
      });
      const hasFlower = Object.values(flowerFlags.current).some(flag => flag > 0);
      if (!hasFlower && newShapes.length > 0) {
        const randomIndex = Math.floor(Math.random() * newShapes.length);
        flowerFlags.current[randomIndex] = Math.floor(Math.random() * 2) + 1;
      }
    }
  }, [text, isP5Setup]);

  // Scroll then initialize drop animation
  useEffect(() => {
    if (clicks >= text.length && text.length) {
      const scrollTimeout = setTimeout(() => {
        const scrollDuration = 2000; // 2 seconds for a slower, smoother scroll
        smoothScrollBy(canvasH.current, scrollDuration);
        
        const dropTimeout = setTimeout(() => {
          shapes.forEach((_, i) => {
            dropOffsets.current[i] = -canvasH.current;
            dropVelocities.current[i] = 0;
            flowerFlags.current[i] = Math.random() < 0.3 ? (Math.floor(Math.random() * 2) + 1) : 0;
          });
          const hasFlower = Object.values(flowerFlags.current).some(flag => flag > 0);
          if (!hasFlower && shapes.length > 0) {
            const randomIndex = Math.floor(Math.random() * shapes.length);
            flowerFlags.current[randomIndex] = Math.floor(Math.random() * 2) + 1;
          }
          hasScrolled.current = true;
        }, scrollDuration); // Match drop timeout to scroll duration
        return () => clearTimeout(dropTimeout);
      }, 1000);
      return () => clearTimeout(scrollTimeout);
    }
  }, [clicks, text.length]);

  // p5 preload
  const preload = p5 => {
    leafImage = p5.loadImage('/assets/images/grass.svg');
    overlayImage = p5.loadImage('/assets/images/flower1.svg');
    overlayImage2 = p5.loadImage('/assets/images/flower2.svg');
    customFont = p5.loadFont('/assets/fonts/JollyLodger-Regular.ttf');
>>>>>>> origin/solmin5
  };

  const setupCanvas = (p5, parentRef) => {
    canvasW.current = p5.windowWidth;
    canvasH.current = p5.windowHeight;
<<<<<<< HEAD
    p5.createCanvas(canvasW.current, canvasH.current).parent(parentRef);
    p5.noStroke();
    p5.textFont("JollyLodger, sans-serif");
    if (leafImage?.width) imageAspectRatio.current = leafImage.width / leafImage.height;

=======
    p5.createCanvas(canvasW.current, canvasH.current * 2).parent(parentRef);
    p5.noStroke();
    if (customFont) p5.textFont(customFont);
    if (leafImage?.width) imageAspectRatio.current = leafImage.width / leafImage.height;
>>>>>>> origin/solmin5
    setIsP5Setup(true);
  };

  const windowResized = p5 => {
    canvasW.current = p5.windowWidth;
    canvasH.current = p5.windowHeight;
<<<<<<< HEAD
    p5.resizeCanvas(canvasW.current, canvasH.current);
  };

  const mousePressed = p5 => {
    let shouldShowFlowerPage = false;

    for (let i = 0; i < shapes.length; i++) {
      const s = shapes[i];
=======
    p5.resizeCanvas(canvasW.current, canvasH.current * 2);
  };

  const mousePressed = p5 => {
    shapes.forEach((s, i) => {
      if (usedShapes.current.has(i)) return;
>>>>>>> origin/solmin5
      const bx = s.xRatio * canvasW.current;
      const by = s.yRatio * canvasH.current;
      const w = s.wRatio * canvasW.current;
      const h = w / imageAspectRatio.current;
      const dx = p5.mouseX - bx;
      const dy = p5.mouseY - by;
<<<<<<< HEAD

      if ((dx * dx) / (w * w / 4) + (dy * dy) / (h * h / 4) <= 1) {

        if (activeFlowers.current[i]) {
          const flowerYPos = by - h / 3;
          const flowerHeight = h * 1.3;

          if (p5.mouseX > bx - w / 2 && p5.mouseX < bx + w / 2 &&
            p5.mouseY > flowerYPos - flowerHeight / 2 && p5.mouseY < flowerYPos + flowerHeight / 2) {

            shouldShowFlowerPage = true;

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

    if (shouldShowFlowerPage) {
      setShowFlowerPage(true);
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

    const curTop = p5.color(appSettings.topColor);
    const curBot = p5.color(appSettings.bottomColor);

    let TopR = (curTop.levels[0] + deltaRGB.current.r * progress + 512) % 512;
    let TopG = (curTop.levels[1] + deltaRGB.current.g * progress + 512) % 512;
    let TopB = (curTop.levels[2] + deltaRGB.current.b * progress + 512) % 512;

    let BottomR = (curBot.levels[0] + deltaRGB.current.r * progress + 512) % 512;
    let BottomG = (curBot.levels[1] + deltaRGB.current.g * progress + 512) % 512;
    let BottomB = (curBot.levels[2] + deltaRGB.current.b * progress + 512) % 512;

    if (TopR >= 256) TopR = 512 - TopR;
    if (TopG >= 256) TopG = 512 - TopG;
    if (TopB >= 256) TopB = 512 - TopB;
    if (BottomR >= 256) BottomR = 512 - BottomR;
    if (BottomG >= 256) BottomG = 512 - BottomG;
    if (BottomB >= 256) BottomB = 512 - BottomB;

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

=======
      if ((dx*dx)/(w*w/4) + (dy*dy)/(h*h/4) <= 1) {
        usedShapes.current.add(i);
        new Audio(waterSounds[Math.floor(Math.random()*waterSounds.length)]).play();
        leafOffsets.current[i] = 20;
        leafVelocities.current[i] = 0;
        waterPoints.current.push({ x: bx, y: by + h/4, startFrame: p5.frameCount, maxAge: 90, ripples: [
          { delay: 0,  maxRadius: p5.random(240,700), speed: p5.random(0.8,1.0) },
          { delay:20, maxRadius: p5.random(200,260), speed: p5.random(0.6,0.9) },
          { delay:40, maxRadius: p5.random(80,140),  speed: p5.random(0.4,0.7) }
        ]});
        if (clickCount.current < text.length) {
          textWaves.current.push({ shapeIdx: i, letterIdx: clickCount.current, startFrame: p5.frameCount });
          clickCount.current++;
          setClicks(c => c + 1);
        }
      }
    });

    if (hasScrolled.current) {
      shapes.forEach((s, i) => {
        if (!flowerFlags.current[i]) return;

        const bx = s.xRatio * canvasW.current;
        const by = s.yRatio * canvasH.current + canvasH.current;
        const w = s.wRatio * canvasW.current;
        const h = w / imageAspectRatio.current;
        const flowerY = by - h / 4;

        const distance = p5.dist(p5.mouseX, p5.mouseY, bx, flowerY);
        if (distance < Math.max(w, h) / 2) {
          navigate('/flower-page');
        }
      });
    }
  };

  const draw = p5 => {
    for (let y = 0; y < canvasH.current * 2; y++) {
      const t = Math.min(Math.max(y / (canvasH.current * 0.69), 0), 1);
      p5.stroke(p5.lerpColor(p5.color('#FFFDDA'), p5.color('#BBFFD9'), t));
      p5.line(0, y, canvasW.current, y);
    }
>>>>>>> origin/solmin5
    waterPoints.current = waterPoints.current.filter(g => p5.frameCount - g.startFrame < g.maxAge);
    waterPoints.current.forEach(g => {
      const age = p5.frameCount - g.startFrame;
      g.ripples.forEach(r => {
        if (age > r.delay) {
          const rad = (age - r.delay) * r.speed;
          if (rad < r.maxRadius) {
            const alpha = Math.sin((rad / r.maxRadius) * Math.PI) * 255;
<<<<<<< HEAD
            p5.noFill(); p5.stroke(255, 255, 255, alpha); p5.strokeWeight(8);
            p5.ellipse(g.x, g.y, rad * 5, rad * 3);
=======
            p5.noFill(); p5.stroke(255,255,255,alpha); p5.strokeWeight(8);
            p5.ellipse(g.x, g.y, rad*5, rad*3);
>>>>>>> origin/solmin5
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
<<<<<<< HEAD
      let bOff = leafOffsets.current[i] || 0;
      let bVel = leafVelocities.current[i] || 0;
      if (bOff || bVel) {
        bVel += -0.2 * bOff; bVel *= 0.75; bOff += bVel;
        if (Math.abs(bOff) < 0.5 && Math.abs(bVel) < 0.5) bOff = bVel = 0;
        leafOffsets.current[i] = bOff; leafVelocities.current[i] = bVel;
      }
      const yPos = by + bOff;

      // 1. 연잎 그리기
=======
      let dOff = dropOffsets.current[i] || 0;
      let dVel = dropVelocities.current[i] || 0;
      if (dOff < 0) {
        dVel += 0.5;
        dOff += dVel;
        if (dOff > 0) { dOff = 0; dVel = 0; }
        dropOffsets.current[i] = dOff;
        dropVelocities.current[i] = dVel;
      }
      let bOff = leafOffsets.current[i] || 0;
      let bVel = leafVelocities.current[i] || 0;
      if (bOff || bVel) {
        bVel += -0.2 * bOff;
        bVel *= 0.75;
        bOff += bVel;
        if (Math.abs(bOff) < 0.5 && Math.abs(bVel) < 0.5) bOff = bVel = 0;
        leafOffsets.current[i] = bOff;
        leafVelocities.current[i] = bVel;
      }
      const yPos = by + dOff + bOff;
>>>>>>> origin/solmin5
      p5.push();
      p5.imageMode(p5.CENTER);
      p5.tint(s.color);
      p5.image(leafImage, bx, yPos, w, h);
      p5.pop();
<<<<<<< HEAD

      // 2. 꽃 그리기 (활성화된 경우)
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
        const letter = appSettingsRef.current.text[evt.letterIdx]; if (!letter) return;
=======
      textWaves.current.forEach(evt => {
        if (evt.shapeIdx !== i) return;
        const letter = text[evt.letterIdx]; if (!letter) return;
>>>>>>> origin/solmin5
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
<<<<<<< HEAD
        ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2; ctx.shadowBlur = 4;
        ctx.shadowColor = `rgba(195,240,255,${alpha / 255 * 0.6})`;
        p5.fill(0, 95, 36, alpha);
=======
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur    = 4;
        ctx.shadowColor   = `rgba(195,240,255,${alpha/255*0.6})`;
        p5.fill(0,95,36,alpha);
>>>>>>> origin/solmin5
        p5.text(letter, tx, ty);
        p5.pop();
      });
    });

<<<<<<< HEAD
    p5.pop();
  };
  const handleBackFromFlowerPage = () => {
    setShowFlowerPage(false);
  };

  if (showFlowerPage) {
    return <FlowerPage onBack={handleBackFromFlowerPage} />;
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
=======
    shapes.forEach((s, i) => {
      const bx = s.xRatio * canvasW.current;
      const by = s.yRatio * canvasH.current;
      const w = s.wRatio * canvasW.current;
      const h = w / imageAspectRatio.current;
      const yPosStatic = by + canvasH.current;
      const flowerType = flowerFlags.current[i];

      // Draw shadow first
      if (hasScrolled.current && flowerType) {
        const flowerImg = flowerType === 1 ? overlayImage : overlayImage2;
        const flowerY = yPosStatic - h / 4;
        const shadowY = flowerY + h / 1.5;
        p5.push();
        p5.imageMode(p5.CENTER);
        p5.translate(bx, shadowY);
        p5.scale(1, -1);
        p5.tint(0, 50);
        p5.image(flowerImg, 0, 0, w * 0.8, h * 0.8);
        p5.pop();
      }

      p5.push();
      p5.imageMode(p5.CENTER);
      p5.tint(s.color);
      p5.image(leafImage, bx, yPosStatic, w, h);

      // Draw original flower on top of the leaf
      if (hasScrolled.current && flowerType) {
        p5.noTint();
        const flowerImg = flowerType === 1 ? overlayImage : overlayImage2;
        p5.image(flowerImg, bx, yPosStatic - h/4, w, h);
      }
      p5.pop();
    });
  };

  return (
    <div style={{ textAlign: 'center', lineHeight: 0 }}>
      <audio id="bgm" src="/assets/music/canvas02_back.mp3" loop muted style={{ display:'none' }} />
      <div style={{ position:'relative', width:'100%', height:'200vh' }}>
        <div style={{ position:'absolute', top:0, left:0, zIndex:10 }}>
          <input
            type="text"
            placeholder="텍스트를 입력하세요"
            value={text}
            onChange={e => setText(e.target.value)}
            style={{ padding:'8px', margin:'16px', width:'60%' }}
          />
        </div>
>>>>>>> origin/solmin5
        <Sketch
          preload={preload}
          setup={setupCanvas}
          draw={draw}
          windowResized={windowResized}
          mousePressed={mousePressed}
<<<<<<< HEAD
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
=======
        />
      </div>
      <div
        id="next-section"
        style={{
          height:'100vh',
          background:'linear-gradient(to bottom, #BBFFD9 0%, #D8F0FF 78%, #D6EFFF 88%)',
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          fontSize:'2rem'
        }}
      >
        🎉 새로운 페이지에 온 걸 환영해요!
      </div>
>>>>>>> origin/solmin5
    </div>
  );
}