import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CircleMenu.css';

export default function CircleMenu() {
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Grass', path: '/grass-art', frame: 'Frame 16' },
    { label: 'Flower', path: '/flower-page', frame: 'Frame 17' },
    { label: 'Universe', path: '/universe', frame: 'Frame 18' },
    { label: 'River', path: '/river', frame: 'Frame 19' },
    { label: 'Wipe', path: '/wipe', frame: 'Frame 20' },
  ];

  return (
    <div className="circle-menu">
      <div className="center-button">🌟</div>

      {menuItems.map((item, index) => (
        <div
          key={item.label}
          className="menu-item"
          style={{
            transform: `rotate(${(360 / menuItems.length) * index}deg) translate(120px) rotate(-${(360 / menuItems.length) * index}deg)`
          }}
          onClick={() => navigate(item.path)}
        >
          <div className="menu-circle">{item.label}</div>
          <span className="frame-label">{item.frame}</span>
        </div>
      ))}
    </div>
  );
}
