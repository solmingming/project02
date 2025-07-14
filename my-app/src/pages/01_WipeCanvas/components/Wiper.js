import React from 'react';

function Wiper({ pivotX, pivotY, angle, length, thickness }) {
  const style = {
    position: 'absolute',
    left: `${pivotX}px`,
    top: `${pivotY}px`,
    width: `${length}px`,
    height: `${thickness}px`,
    backgroundColor: '#ffffff',
    border: '2px solid white',
    borderRadius: `${thickness / 2}px`,
    
    transformOrigin: '0% 50%', 
    
    transform: `translateY(-50%) rotate(${angle}deg)`, 
    
    pointerEvents: 'none',
    zIndex: 5
  };

  return <div style={style}></div>;
}

export default Wiper;