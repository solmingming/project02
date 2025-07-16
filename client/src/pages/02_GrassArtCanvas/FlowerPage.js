import React from 'react';

const FlowerPage = () => {
  return (
    <div style={{
      display: 'flex',
<<<<<<< HEAD
      justifyContent: 'left', // Center horizontally
=======
      justifyContent: 'center', // Center horizontally
>>>>>>> origin/solmin5
      alignItems: 'center', // Center vertically
      height: '100vh',
      background: 'linear-gradient(to bottom, #CBFFBA, #FEE8FF)',
      overflow: 'hidden'
    }}>
      <img 
<<<<<<< HEAD
        src="/assets/images/MainFlower.svg"
        alt="Main Flower"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain'
=======
        src="/assets/images/MainFlower.png" 
        alt="Main Flower"
        style={{
          width: '90%', // Make it large, but with a small margin
          height: '90%',
          objectFit: 'contain' // Ensure the whole image is visible
>>>>>>> origin/solmin5
        }}
      />
    </div>
  );
};

export default FlowerPage;