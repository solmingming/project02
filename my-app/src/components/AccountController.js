import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import LoginModal from './LoginModal';
import './AccountController.css';

const AccountController = () => {
  const { user } = useAuth();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (isPopoverOpen && containerRef.current && !containerRef.current.contains(event.target)) {
        setIsPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isPopoverOpen]);

  const togglePopover = () => {
    setIsPopoverOpen(prev => !prev);
  };
  
  const closePopover = () => {
    setIsPopoverOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name[0].toUpperCase();
  };

  // 로그인 상태에 따라 클래스 이름을 조건부로 설정합니다.
  const wrapperClass = `account-icon-wrapper ${!user ? 'logged-out-border' : ''}`;

  return (
    <div className="account-controller-container" ref={containerRef}>
      {/* ▼▼▼ className에 변수를 적용합니다. ▼▼▼ */}
      <div className={wrapperClass} onClick={togglePopover}>
        {user ? (
          user.picture ? (
            <img src={user.picture} alt="Profile" className="account-profile-pic" />
          ) : (
            <div className="account-initials-circle">{getInitials(user.nickname)}</div>
          )
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        )}
      </div>
      {/* ▲▲▲ className 변경 완료 ▲▲▲ */}

      {isPopoverOpen && <LoginModal onClose={closePopover} />}
    </div>
  );
};

export default AccountController;