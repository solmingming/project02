import React from 'react';

const FlowerPage = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'left', // Center horizontally
      alignItems: 'center', // Center vertically
      height: '100vh',
      background: 'linear-gradient(to bottom, #CBFFBA, #FEE8FF)',
      overflow: 'hidden'
    }}>
      <img 
        src="/assets/images/MainFlower.svg"
        alt="Main Flower"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain'
        }}
      />
    </div>
  );
};

export default FlowerPage;