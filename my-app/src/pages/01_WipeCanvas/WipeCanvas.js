import React, { useState, useEffect, useRef } from 'react';
import Letter from './components/Letter';
import Wiper from './components/Wiper';
import '../../App.css';

const CHARS = "GLITZ";
const LETTER_SIZE = 75;
const DIV = 12000;
let MAX_LETTERS = Math.floor((window.innerHeight * window.innerWidth) / DIV);
const LETTER_KICK_FORCE = 1.04;

let WIPER_LENGTH = window.innerHeight;
const WIPER_THICKNESS = 20;
const RESTITUTION = 0.6;

let WIPER_PIVOT_X = window.innerWidth / 2;
let WIPER_PIVOT_Y = window.innerHeight + 20;

const WIPER_CENTER_ANGLE = -90;
const WIPER_SWEEP_AMPLITUDE = 85;
const WIPER_SPEED = 0.0013;

const steepness = 1.0;
const subStep = 4;

let count = 0;

function getSpeed(length) {
  const normalizedInput = (length - 1) / (MAX_LETTERS - 1);
  const transformedInput = (normalizedInput - 0.5) * steepness;
  const shapedValue = 1 / (1 + Math.exp(transformedInput));
  const outputRange = 11 - 1;
  const outputMin = 1;
  const finalOutput = (shapedValue * outputRange) + outputMin;
  return finalOutput;
}

const WipeCanvas = () => {
  const [letters, setLetters] = useState([]);
  const [wiperAngle, setWiperAngle] = useState(WIPER_CENTER_ANGLE);
  const animationFrameId = useRef(null);
  const isMouseDownRef = useRef(false);

  let lastTimestamp = 0;
  let cA = 0;

  useEffect(() => {
    const animate = (timestamp) => {
      WIPER_PIVOT_X = window.innerWidth / 2;
      WIPER_PIVOT_Y = window.innerHeight + 20;
      WIPER_LENGTH = window.innerHeight;
      MAX_LETTERS = Math.floor((window.innerHeight * window.innerWidth) / DIV);

      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      cA += deltaTime * (isMouseDownRef.current ? 1.5 : 1) * WIPER_SPEED;
      count++;

      for (let i = 0; i < subStep; i++) {

        setLetters(prevLetters => {
          let lettersCopy = prevLetters.map(l => ({ ...l }));

          const angleRad = currentAngle * Math.PI / 180;

          for (const letter of lettersCopy) {
            const letterRadius = LETTER_SIZE / 2;
            const pivot = { x: WIPER_PIVOT_X, y: WIPER_PIVOT_Y };

            const vecFromPivot = { x: letter.x - pivot.x, y: letter.y - pivot.y };
            
            const cosA_neg = Math.cos(-angleRad);
            const sinA_neg = Math.sin(-angleRad);

            const localX = vecFromPivot.x * cosA_neg - vecFromPivot.y * sinA_neg;
            const localY = vecFromPivot.x * sinA_neg + vecFromPivot.y * cosA_neg;

            const closestX = Math.max(0, Math.min(localX, WIPER_LENGTH));
            const closestY = Math.max(-WIPER_THICKNESS / 2, Math.min(localY, WIPER_THICKNESS / 2));
            
            const distVec = { x: localX - closestX, y: localY - closestY };
            const distSq = distVec.x * distVec.x + distVec.y * distVec.y;

            if (distSq < letterRadius * letterRadius && distSq > 0) {
              const dist = Math.sqrt(distSq);
              const overlap = letterRadius - dist;

              const localNormalX = distVec.x / dist;
              const localNormalY = distVec.y / dist;

              const cosA_pos = Math.cos(angleRad);
              const sinA_pos = Math.sin(angleRad);
              
              const worldNormalX = localNormalX * cosA_pos - localNormalY * sinA_pos;
              const worldNormalY = localNormalX * sinA_pos + localNormalY * cosA_pos;

              letter.x += worldNormalX * overlap;
              letter.y += worldNormalY * overlap;

              const velDotNormal = letter.speedX * worldNormalX + letter.speedY * worldNormalY;

              if (velDotNormal < 0) {
                const impulse = -(1 + RESTITUTION) * velDotNormal;
                letter.speedX += impulse * worldNormalX;
                letter.speedY += impulse * worldNormalY;
              }
            }
          }

          for (let i = 0; i < lettersCopy.length; i++) {
            for (let j = i + 1; j < lettersCopy.length; j++) {
              const letterA = lettersCopy[i];
              const letterB = lettersCopy[j];
              const dx = letterB.x - letterA.x;
              const dy = letterB.y - letterA.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const minDistance = LETTER_SIZE;
              if (distance < minDistance && distance > 0) {
                const overlap = (minDistance - distance) / 2;
                const nx = dx / distance; const ny = dy / distance;
                
                letterA.x -= overlap * nx; letterA.y -= overlap * ny;
                letterB.x += overlap * nx; letterB.y += overlap * ny;

                const tx = -ny; const ty = nx;
                const dpTanA = letterA.speedX * tx + letterA.speedY * ty;
                const dpNormA = letterA.speedX * nx + letterA.speedY * ny;
                const dpTanB = letterB.speedX * tx + letterB.speedY * ty;
                const dpNormB = letterB.speedX * nx + letterB.speedY * ny;
                const m1 = (dpNormA * (1 - 1) + 2 * 1 * dpNormB) / (1 + 1) * LETTER_KICK_FORCE;
                const m2 = (dpNormB * (1 - 1) + 2 * 1 * dpNormA) / (1 + 1) * LETTER_KICK_FORCE;
                letterA.speedX = tx * dpTanA + nx * m1;
                letterA.speedY = ty * dpTanA + ny * m1;
                letterB.speedX = tx * dpTanB + nx * m2;
                letterB.speedY = ty * dpTanB + ny * m2;
              }
            }
          }
          
          function calSpeedY(speed) {
            if (speed > 0)
              return Math.max(speed * (0.98 ** (1 / subStep)), 1.5);
            return speed + 0.05 / subStep;
          }

          let updatedLetters = lettersCopy.map(letter => ({
            ...letter,
            x: letter.x + letter.speedX / subStep,
            y: letter.y + letter.speedY / subStep,
            speedX: letter.speedX * (0.985 ** (1/subStep)),
            speedY: calSpeedY(letter.speedY),
            rotation: letter.rotation + letter.rotSpeed / subStep,
          }));

          const visibleLetters = updatedLetters.filter(letter =>
            letter.y < window.innerHeight &&
            letter.y > -LETTER_SIZE * 1.2 &&
            letter.x > -LETTER_SIZE &&
            letter.x < window.innerWidth
          );

          const numRemoved = Math.min(MAX_LETTERS - visibleLetters.length, 50);
          const newLetters = [];

          function getRotSpeed() {
            const speed = Math.random() - 0.5;
            if (speed > 0.25 || speed < -0.25)
              return speed;
            return 0;
          }

          if (count % 3 == 0 && numRemoved > 0) {
              const char = CHARS[Math.floor(Math.random() * CHARS.length)];
              newLetters.push({
                id: Math.random(),
                char: char,
                x: Math.random() * window.innerWidth,
                y: -LETTER_SIZE,
                rotation: Math.random() * 360,
                speedX: (Math.random() - 0.5) * 2,
                speedY: getSpeed(visibleLetters.length),
                maxSpeedX: Math.random(),
                rotSpeed: getRotSpeed(),
              });
          }

          return [...visibleLetters, ...newLetters];
        });
      }
      
      const currentAngle = WIPER_CENTER_ANGLE + Math.sin(cA) * WIPER_SWEEP_AMPLITUDE;
      setWiperAngle(currentAngle);

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId.current);
  }, []);

  const handleMouseDown = () => {
    isMouseDownRef.current = true;
  };
  
  const handleMouseUp = () => {
    isMouseDownRef.current = false;
  };

  return (
    <div 
      className="Wipe"
      style={{
        backgroundColor: '#FFDA73',
        position: 'relative',
        width: '100vw',
        height: '100vh'
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} 
    >
      <Wiper
        pivotX={WIPER_PIVOT_X}
        pivotY={WIPER_PIVOT_Y}
        angle={wiperAngle}
        length={WIPER_LENGTH}
        thickness={WIPER_THICKNESS}
      />

      {letters.map(letter => (
        <Letter key={letter.id} {...letter} />
      ))}
    </div>
  );
}

export default WipeCanvas;