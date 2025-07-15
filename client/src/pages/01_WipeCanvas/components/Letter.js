import React from 'react';

const Letter = ({ char, x, y, rotation, fontSize }) => {
  const style = {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    transform: `rotate(${rotation}deg)`,
    fontSize: `${fontSize}px`,
    fontWeight: 'bold',
    userSelect: 'none',
    color: '#ffffff',
  };

  return <span style={style}>{char}</span>;
};

export default Letter;