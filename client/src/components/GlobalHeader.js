import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './GlobalHeader.css';

const navItems = [
  { path: '/bouncing', name: 'Bouncing', previewSvg: '/assets/images/Landingpreview.svg', angle: 270, distance: 82 },
  { path: '/wipe', name: 'Wipe', previewSvg: '/assets/images/Wipepreview.svg', angle: 225, distance: 90 },
  { path: '/grass-art', name: 'Grass Art', previewSvg: '/assets/images/Grassartpreview.svg', angle: 180, distance: 90 },
  { path: '/river', name: 'River', previewSvg: '/assets/images/River_preview.svg', angle: 135, distance: 90 },
<<<<<<< HEAD
  { path: '/universe', name: 'Universe', previewSvg: '/assets/images/universeIcon.svg', angle: 90, distance: 82 },
=======
  { path: '/', name: 'Waves', previewSvg: '/assets/images/Wavespreview.svg', angle: 90, distance: 82 },
>>>>>>> origin/solmin5
];

const GlobalHeader = ({ onLogoClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
<<<<<<< HEAD
    <div
      className="global-header-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <header className={`global-header ${isHovered ? 'hovered' : ''}`}>
        <div className={`nav-container ${isHovered ? 'hovered' : ''}`}>
          <button type="button" className="main-logo" onClick={onLogoClick}>
            <img src="/assets/images/Glitz_custom_button.svg" alt="Glitz Main Logo" />
          </button>
          <nav className="nav-previews">
            {navItems.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                className="preview-item"
                style={{
                  '--angle': `${item.angle}deg`,
                  '--distance': `${item.distance}px`,
                  transitionDelay: isHovered ? `${0.05 * (index + 1)}s` : '0s',
                }}
              >
                <img src={item.previewSvg} alt={`${item.name} preview`} className="preview-icon-svg" />
              </Link>
            ))}
          </nav>
        </div>
      </header>
    </div>
=======
    <header
      className={`global-header ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`nav-container ${isHovered ? 'hovered' : ''}`}>
        <button type="button" className="main-logo" onClick={onLogoClick}>
          <img src="/assets/images/Glitz_custom_button.svg" alt="Glitz Main Logo" />
        </button>
        <nav className="nav-previews">
          {navItems.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              className="preview-item"
              style={{
                '--angle': `${item.angle}deg`,
                '--distance': `${item.distance}px`,
                transitionDelay: isHovered ? `${0.05 * (index + 1)}s` : '0s',
              }}
            >
              <img src={item.previewSvg} alt={`${item.name} preview`} className="preview-icon-svg" />
            </Link>
          ))}
        </nav>
      </div>
    </header>
>>>>>>> origin/solmin5
  );
};

export default GlobalHeader;