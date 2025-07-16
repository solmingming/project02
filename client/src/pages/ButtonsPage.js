import React from 'react';
import { useNavigate } from 'react-router-dom';

const ButtonsPage = () => {
  const navigate = useNavigate();
  return (
    <div style={{ padding: 20 }}>
      <h1>My Canvas App</h1>
      <button onClick={() => navigate('/wipe')} style={{ marginRight: 10 }}>
        Go to Wipe Canvas
      </button>
      <button onClick={() => navigate('/river')}>
        Go to River Canvas
      </button>
    </div>
  );
};

export default ButtonsPage;
