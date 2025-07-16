import React, { useState, useEffect, useRef } from 'react';
import { HexColorPicker } from 'react-colorful';
import './BouncingSettings.css';

// ✅ 1. API 직접 호출이 더 이상 필요 없으므로 import 문을 제거합니다.
// import { createBouncing } from '../../api'; 

const saveIcon = process.env.PUBLIC_URL + '/save.svg';

const BouncingSettings = ({ isOpen, onClose, onColorChange, onSettingsChange, onTextChange, initialSettings }) => {
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

  const handleDampingChange = (e) => {
    const value = parseFloat(e.target.value);
    setTempSettings(prev => ({ ...prev, damping: value }));
  };

  const handleKValueChange = (e) => {
    const value = parseFloat(e.target.value);
    setTempSettings(prev => ({ ...prev, kValue: value }));
  };

  const handleSampleFactorChange = (e) => {
    const value = parseFloat(e.target.value);
    setTempSettings(prev => ({ ...prev, sampleFactor: value }));
  };

  const handleTextSizeChange = (e) => {
    const value = parseFloat(e.target.value);
    setTempSettings(prev => ({ ...prev, textSize: value }));
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

  // ✅ 2. handleSave 함수를 대폭 수정합니다.
  // 이제 이 함수는 async일 필요가 없으며, API 호출 로직 전체를 제거합니다.
  const handleSave = () => {
    // 1. 부모 컴포넌트(BouncingPage)에 변경된 사항을 전달합니다.
    // 이 함수들이 호출되면, BouncingPage의 state가 변경되고,
    // BouncingPage의 로직에 따라 DB 저장이 트리거됩니다.
    onColorChange(tempSettings.topColor, tempSettings.bottomColor);
    onSettingsChange({
      damping: tempSettings.damping,
      kValue: tempSettings.kValue,
      sampleFactor: tempSettings.sampleFactor,
      textSize: tempSettings.textSize,
    });
    onTextChange(tempSettings.text);

    // 2. 모든 변경사항을 부모에게 전달한 후, 설정 패널을 닫습니다.
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
    if (length <= 5) return '3rem';
    if (length <= 8) return '2.5rem';
    if (length <= 12) return '2rem';
    if (length <= 16) return '1.5rem';
    return '1rem';
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
          {/* ... 나머지 JSX는 변경할 필요 없음 ... */}
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
                  <label>damping</label>
                  <span className="slider-value">{tempSettings.damping.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="0.9"
                  step="0.01"
                  value={tempSettings.damping}
                  onChange={handleDampingChange}
                />
              </div>
              <div className="slider-container">
                <div className="slider-label">
                  <label>k-value</label>
                  <span className="slider-value">{tempSettings.kValue.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.01"
                  value={tempSettings.kValue}
                  onChange={handleKValueChange}
                />
              </div>
              <div className="slider-container">
                <div className="slider-label">
                  <label>sample factor</label>
                  <span className="slider-value">{tempSettings.sampleFactor.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={tempSettings.sampleFactor}
                  onChange={handleSampleFactorChange}
                />
              </div>
              <div className="slider-container">
                <div className="slider-label">
                  <label>text size</label>
                  <span className="slider-value">{tempSettings.textSize.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.4"
                  step="0.01"
                  value={tempSettings.textSize}
                  onChange={handleTextSizeChange}
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

export default BouncingSettings;