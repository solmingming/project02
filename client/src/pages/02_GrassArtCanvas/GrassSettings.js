import React, { useState, useEffect, useRef } from 'react';
import { HexColorPicker } from 'react-colorful';
import './GrassSettings.css';

const saveIcon = process.env.PUBLIC_URL + '/save.svg';

const GrassSettings = ({ isOpen, onClose, onColorChange, onSettingsChange, onTextChange, initialSettings }) => {
  const [tempSettings, setTempSettings] = useState(initialSettings);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);
  const [showTopPicker, setShowTopPicker] = useState(false);
  const [showBottomPicker, setShowBottomPicker] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTempSettings(initialSettings);
      setShowTopPicker(false);
      setShowBottomPicker(false);
    }
  }, [isOpen, initialSettings]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  if (!isOpen) {
    return null;
  }

  const haveChanges = JSON.stringify(initialSettings) !== JSON.stringify(tempSettings);

  const handleTopColorChange = (color) => {
    setTempSettings(prev => ({ ...prev, topColor: color }));
  };

  const handleBottomColorChange = (color) => {
    setTempSettings(prev => ({ ...prev, bottomColor: color }));
  };

  const handleTextChangeInternal = (e) => {
    if (e.target.value.length <= 20) {
      setTempSettings(prev => ({...prev, text: e.target.value}));
    }
  };

  const handleTextClick = () => {
    setIsEditing(true);
  };

  const handleTextBlur = () => {
    setIsEditing(false);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTextBlur();
    }
  };

  const handleSave = () => {
    onColorChange(tempSettings.topColor, tempSettings.bottomColor);
    onTextChange(tempSettings.text);
    onClose();
  };

  const handleClose = () => {
    if (haveChanges) {
      if (window.confirm("정말 변경을 취소하시겠습니까?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const getFontSizeForPanel = (length) => {
  if (length <= 5) {
    return '3rem';
  } else if (length <= 8) {
    return '2.5rem';
  } else if (length <= 12) {
    return '2rem';
  } else if (length <= 16) {
    return '1.5rem';
  } else {
    return '1rem';
  }
};

  const textStyle = {
    fontSize: getFontSizeForPanel(tempSettings.text.length),
  };

  const handlePanelClick = () => {
    if (showTopPicker || showBottomPicker) {
        setShowTopPicker(false);
        setShowBottomPicker(false);
    }
  };

  const handleOverlayClick = () => {
    if (showTopPicker || showBottomPicker) {
      setShowTopPicker(false);
      setShowBottomPicker(false);
    } else {
      handleClose();
    }
  };

  const toggleTopPicker = (e) => {
    e.stopPropagation();
    setShowTopPicker(prev => !prev);
    setShowBottomPicker(false);
  };

  const toggleBottomPicker = (e) => {
    e.stopPropagation();
    setShowBottomPicker(prev => !prev);
    setShowTopPicker(false);
  };

  return (
    <div className="settings-overlay" onClick={handleOverlayClick}>
      <div className="settings-panel" onClick={(e) => { e.stopPropagation(); handlePanelClick(); }}>
        <div className="settings-panel-content">
          <div className="top-section">
            <div className="gradient-preview-container">
              <div
                className="gradient-preview"
                style={{ background: `linear-gradient(to bottom, ${tempSettings.topColor}, ${tempSettings.bottomColor})` }}
              >
                <div className="color-area top" onClick={toggleTopPicker}></div>
                <div className="color-area bottom" onClick={toggleBottomPicker}></div>
              </div>
              {showTopPicker && (
                <div className="color-picker-wrapper top" onClick={(e) => e.stopPropagation()}>
                  <HexColorPicker color={tempSettings.topColor} onChange={handleTopColorChange} />
                </div>
              )}
              {showBottomPicker && (
                <div className="color-picker-wrapper bottom" onClick={(e) => e.stopPropagation()}>
                  <HexColorPicker color={tempSettings.bottomColor} onChange={handleBottomColorChange} />
                </div>
              )}
            </div>

            <div className="main-controls">
              <div className="glitz-text-container">
                {isEditing ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={tempSettings.text}
                    onChange={handleTextChangeInternal}
                    onBlur={handleTextBlur}
                    onKeyDown={handleInputKeyDown}
                    className="glitz-text-input"
                    style={textStyle}
                    maxLength="20"
                  />
                ) : (
                  <p
                    className="glitz-text"
                    onClick={(e) => { e.stopPropagation(); handleTextClick(); }}
                    style={textStyle}
                  >
                    {tempSettings.text || "Glitz"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="save-button-container">
            <img src={saveIcon} alt="Save" className="save-button" onClick={handleSave} />
        </div>
      </div>
    </div>
  );
};

export default GrassSettings;