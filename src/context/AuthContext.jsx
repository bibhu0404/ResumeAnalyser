import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const profile = await authApi.getCurrentUser();
          setUser(profile);
          localStorage.setItem('user', JSON.stringify(profile));
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const handleAuthSuccess = (data) => {
    setToken(data.token);
    localStorage.setItem('token', data.token);

    const userObj = {
      id: data.id,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      pictureUrl: data.pictureUrl,
    };
    setUser(userObj);
    localStorage.setItem('user', JSON.stringify(userObj));
    return userObj;
  };

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    return handleAuthSuccess(data);
  };

  const register = async (fullName, email, password) => {
    const data = await authApi.register(fullName, email, password);
    return handleAuthSuccess(data);
  };

  const googleLogin = async (idToken) => {
    const data = await authApi.googleLogin(idToken);
    return handleAuthSuccess(data);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        googleLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
