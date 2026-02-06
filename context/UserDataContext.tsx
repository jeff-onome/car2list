
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { dbService } from '../services/database';

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning';
}

interface UserData {
  recentlyViewed: string[];
  preferences: {
    darkMode: boolean;
    currency: string;
  };
}

interface UserDataContextType {
  userData: UserData;
  addRecentlyViewed: (id: string) => void;
  toggleDarkMode: () => void;
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (val: boolean) => void;
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (val: boolean) => void;
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData>(() => {
    const saved = localStorage.getItem('autosphere_preferences');
    const preferences = saved ? JSON.parse(saved) : { darkMode: true, currency: 'USD' };
    return {
      recentlyViewed: [],
      preferences
    };
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    // Synchronize initial class state
    if (userData.preferences.darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      const unsubscribe = dbService.subscribeToNotifications(user.id, (data) => {
        setNotifications(data);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const addRecentlyViewed = (id: string) => {
    setUserData(prev => ({
      ...prev,
      recentlyViewed: [id, ...prev.recentlyViewed.filter(i => i !== id)].slice(0, 5)
    }));
  };

  const toggleDarkMode = () => {
    setUserData(prev => {
      const newDarkMode = !prev.preferences.darkMode;
      const newPrefs = { ...prev.preferences, darkMode: newDarkMode };
      
      localStorage.setItem('autosphere_preferences', JSON.stringify(newPrefs));
      
      if (newDarkMode) {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
      
      return {
        ...prev,
        preferences: newPrefs
      };
    });
  };

  const markNotificationAsRead = async (id: string) => {
    if (user?.id) {
      await dbService.markNotificationRead(user.id, id);
    }
  };

  const clearNotifications = async () => {
    if (user?.id) {
      await dbService.clearUserNotifications(user.id);
    }
  };

  return (
    <UserDataContext.Provider value={{ 
      userData, 
      addRecentlyViewed, 
      toggleDarkMode,
      isSidebarCollapsed,
      setSidebarCollapsed,
      isMobileSidebarOpen,
      setMobileSidebarOpen,
      notifications,
      markNotificationAsRead,
      clearNotifications
    }}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};
