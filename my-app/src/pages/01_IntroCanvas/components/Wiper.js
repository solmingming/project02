// src/components/Wiper.js
import React from 'react';

function Wiper({ pivotX, pivotY, angle, length, thickness }) {
  const style = {
    position: 'absolute',
    // 와이퍼의 위치는 고정된 축(pivot) 좌표로 설정
    left: `${pivotX}px`,
    top: `${pivotY}px`,
    width: `${length}px`,
    height: `${thickness}px`,
    backgroundColor: 'rgba(10, 10, 10, 0.9)', // 이미지처럼 어두운 색으로 변경
    border: '2px solid black',
    borderRadius: `${thickness / 2}px`,
    
    // 중요: 회전의 기준점을 왼쪽 중앙(0% 50%)으로 설정
    transformOrigin: '0% 50%', 
    
    // 먼저 Y축으로 -50% 이동하여 두께의 중앙을 pivot에 맞춘 후, 회전시킴
    transform: `translateY(-50%) rotate(${angle}deg)`, 
    
    pointerEvents: 'none',
    zIndex: 5
  };

  return <div style={style}></div>;
}

export default Wiper;