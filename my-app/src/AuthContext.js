// AuthContext.js (예시 코드)

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ★ 로딩 상태 추가

  useEffect(() => {
    // 앱 시작 시 localStorage 등에서 사용자 정보 비동기적으로 가져오는 로직
    try {
      // 예시: localStorage에서 사용자 정보를 가져옵니다.
      const storedUser = localStorage.getItem('user'); // 실제 사용하는 키에 맞춰주세요.
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
    } finally {
      setLoading(false); // ★ 확인 작업이 끝나면 로딩 상태를 false로 변경
    }
  }, []);

  const login = (userData) => {
    // localStorage에도 저장
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    // localStorage에서도 제거
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = { user, login, logout, loading }; // ★ loading을 context value에 포함

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth 훅은 그대로 사용
export const useAuth = () => {
  return useContext(AuthContext);
};