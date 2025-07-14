import React from 'react';

const FlowerPage = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center', // Center horizontally
      alignItems: 'center', // Center vertically
      height: '100vh',
      background: 'linear-gradient(to bottom, #CBFFBA, #FEE8FF)',
      overflow: 'hidden'
    }}>
      <img 
        src="/assets/images/MainFlower.png" 
        alt="Main Flower"
        style={{
          width: '90%', // Make it large, but with a small margin
          height: '90%',
          objectFit: 'contain' // Ensure the whole image is visible
        }}
      />
    </div>
  );
};

export default FlowerPage;