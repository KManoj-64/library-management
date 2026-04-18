import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state once on mount
  useEffect(() => {
    const initAuth = () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          // Simple validation: must have token and role
          if (parsedUser && parsedUser.token && parsedUser.role) {
            setUser(parsedUser);
          } else {
            localStorage.removeItem('user');
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data && res.data.token) {
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
    }
    return res.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const register = useCallback(async (userData) => {
    return await api.post('/auth/register', userData);
  }, []);

  // Memoize value to prevent unnecessary re-renders of consumers
  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    register
  }), [user, loading, login, logout, register]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
