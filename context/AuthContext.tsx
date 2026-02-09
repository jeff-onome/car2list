
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (role: UserRole, userData: User) => void;
  logout: () => void;
  updateUserData: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: UserRole, userData: User) => {
    setUser(userData);
    localStorage.setItem('autosphere_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('autosphere_user');
  };

  const updateUserData = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('autosphere_user', JSON.stringify(updatedUser));
  };

  useEffect(() => {
    const stored = localStorage.getItem('autosphere_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserData, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
