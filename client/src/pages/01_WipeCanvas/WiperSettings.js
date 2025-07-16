import React, { useState, useEffect, useRef } from 'react';
import { HexColorPicker } from 'react-colorful';
import './WiperSettings.css';
import { createWipe } from '../../api';

const saveIcon = process.env.PUBLIC_URL + '/save.svg';

const WiperSettings = ({ isOpen, onClose, onColorChange, onSettingsChange, onTextChange, initialSettings }) => {
  const [showDetails, setShowDetails] = useState(false);
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
      setShowDetails(false);
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

  const handleTextQuantityChange = (e) => {
    const value = parseFloat(e.target.value);
    setTempSettings(prev => ({ ...prev, textQuantity: value }));
  };

  const handleTextSizeChange = (e) => {
    const value = parseFloat(e.target.value);
    setTempSettings(prev => ({ ...prev, textSize: value }));
  };

  const handleKickForceChange = (e) => {
    const value = parseFloat(e.target.value);
    setTempSettings(prev => ({ ...prev, kickForce: value }));
  };

  const handleTextChangeInternal = (e) => {
    if (e.target.value.length <= 5) {
      setTempSettings(prev => ({...prev, text: e.target.value.toUpperCase()}));
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

  // ✅ FIX: 데이터 이름이 통일되었으므로, 더 이상 필드명을 변환하지 않습니다.
  const handleSave = async () => {
    // tempSettings 객체를 그대로 API 함수에 전달합니다.
    const result = await createWipe(tempSettings);

    if (result) {
      console.log('🎉 [Wipe] 서버 저장 성공!', result);
      
      // 성공 시, 부모 컴포넌트의 상태도 업데이트
      onColorChange(tempSettings.topColor, tempSettings.bottomColor);
      onSettingsChange({
        textQuantity: tempSettings.textQuantity,
        textSize: tempSettings.textSize,
        kickForce: tempSettings.kickForce,
      });
      onTextChange(tempSettings.text);

      onClose();
    } else {
      console.error('🔥 [Wipe] 서버 저장 실패!');
    }
  };

  const handleClose = () => {
    onClose();
  };
  
  const getFontSizeForPanel = (length) => {
    return '3rem';
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
                    maxLength="5"
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
              <div className="advanced-controls">
                <div className="advanced-settings-toggle" onClick={(e) => { e.stopPropagation(); setShowDetails(!showDetails); }}>
                  상세 설정
                </div>
              </div>
            </div>
          </div>
          
          {showDetails && (
            <div className="sliders">
              <div className="slider-container">
                <div className="slider-label">
                  <label>Text Quantity</label>
                  <span className="slider-value">{tempSettings.textQuantity.toFixed(0)}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={tempSettings.textQuantity}
                  onChange={handleTextQuantityChange}
                />
              </div>
              <div className="slider-container">
                <div className="slider-label">
                  <label>Text Size</label>
                  <span className="slider-value">{tempSettings.textSize.toFixed(0)}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="1"
                  value={tempSettings.textSize}
                  onChange={handleTextSizeChange}
                />
              </div>
              <div className="slider-container">
                <div className="slider-label">
                  <label>Kick Force</label>
                  <span className="slider-value">{tempSettings.kickForce.toFixed(3)}</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="1.1"
                  step="0.001"
                  value={tempSettings.kickForce}
                  onChange={handleKickForceChange}
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="save-button-container">
            <img src={saveIcon} alt="Save" className="save-button" onClick={handleSave} />
        </div>
      </div>
    </div>
  );
};

export default WiperSettings;
