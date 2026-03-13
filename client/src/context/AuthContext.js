import React, { createContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = (nextUser) => {
    setUser(nextUser);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      api.clearTokens();
    } finally {
      setUser(null);
    }
  };

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    login,
    logout,
    setUser
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
