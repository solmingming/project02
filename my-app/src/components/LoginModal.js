import React, { useState } from 'react';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../AuthContext';
import './LoginModal.css';

const LoginModal = ({ onClose }) => {
  const { user, login, logout } = useAuth();
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [nickname, setNickname] = useState('');
  const [googleProfile, setGoogleProfile] = useState(null);

  const handleGoogleSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    const existingUser = localStorage.getItem(`user_${decoded.sub}`);

    if (existingUser) {
      login(JSON.parse(existingUser));
      onClose();
    } else {
      setGoogleProfile(decoded);
      setIsSigningUp(true);
    }
  };

  const handleGoogleError = () => {
    console.error('Google Login Failed');
    alert('구글 로그인에 실패했습니다. 다시 시도해주세요.');
  };

  const handleNicknameSubmit = (e) => {
    e.preventDefault();
    if (nickname.trim() === '') {
      alert('닉네임을 입력해주세요.');
      return;
    }
    const newUser = {
      googleId: googleProfile.sub,
      email: googleProfile.email,
      name: googleProfile.name,
      picture: googleProfile.picture,
      nickname: nickname,
    };
    localStorage.setItem(`user_${newUser.googleId}`, JSON.stringify(newUser));
    login(newUser);
    onClose();
  };

  const handleLogout = () => {
    googleLogout();
    logout();
    onClose();
  };

  const renderContent = () => {
    if (user) {
      return (
        <div className="popover-content-wrapper">
          <div className="profile-section">
            <img src={user.picture} alt={user.nickname} className="profile-pic" />
            <div className="profile-info">
              <span className="nickname">{user.nickname}</span>
              <span className="email">{user.email}</span>
            </div>
          </div>
          <hr className="separator" />
          <button className="popover-button" onClick={handleLogout}>
            로그아웃
          </button>
          <hr className="separator" />
        </div>
      );
    }

    if (isSigningUp) {
      return (
        <form className="popover-content-wrapper signup-form" onSubmit={handleNicknameSubmit}>
          <h4>환영합니다!</h4>
          <p>사용하실 닉네임을 입력해주세요.</p>
          <input
            type="text"
            placeholder="닉네임 (2~10자)"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="nickname-input"
            minLength="2"
            maxLength="10"
            required
          />
          <button type="submit" className="submit-btn">
            가입 완료 및 시작하기
          </button>
        </form>
      );
    }

    return (
      <div className="popover-content-wrapper login-prompt">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          theme="outline"
          size="large"
          text="signin_with"
          shape="rectangular"
          width="300px"
        />
      </div>
    );
  };

  return (
    <div className="popover-container">
      {renderContent()}
    </div>
  );
};

export default LoginModal;