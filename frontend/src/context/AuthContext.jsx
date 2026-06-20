// frontend/src/context/AuthContext.jsx
// Provides authentication state and actions to the entire app.
// Token and user are stored in localStorage under 'depi_token' / 'depi_user'.

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('depi_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  // On app load: re-validate the stored token against the server
  useEffect(() => {
    const token = localStorage.getItem('depi_token');
    if (token && !user) {
      authAPI.getMe()
        .then(data => {
          setUser(data.user);
          localStorage.setItem('depi_user', JSON.stringify(data.user));
        })
        .catch(() => {
          // Token is invalid or expired – clear local storage
          localStorage.removeItem('depi_token');
          localStorage.removeItem('depi_user');
        });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authAPI.login(email, password);
      if (data.success) {
        localStorage.setItem('depi_token', data.token);
        localStorage.setItem('depi_user', JSON.stringify(data.user));
        setUser(data.user);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('depi_token');
    localStorage.removeItem('depi_user');
  };

  const register = async (name, email, password, role) => {
    setLoading(true);
    try {
      const data = await authAPI.register(name, email, password, role);
      if (data.success) {
        localStorage.setItem('depi_token', data.token);
        localStorage.setItem('depi_user', JSON.stringify(data.user));
        setUser(data.user);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
