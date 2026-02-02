
import React, { createContext, useContext, useState } from 'react';

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
  const [userData, setUserData] = useState<UserData>({
    recentlyViewed: [],
    preferences: {
      darkMode: true,
      currency: 'USD'
    }
  });

  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'Welcome to AutoSphere', message: 'Your luxury journey begins here. Explore the fleet.', time: '2h ago', read: false, type: 'info' },
    { id: '2', title: 'KYC Verified', message: 'Your identity has been confirmed by our specialists.', time: '1d ago', read: false, type: 'success' },
    { id: '3', title: 'Security Alert', message: 'New login detected from a Safari browser.', time: '2d ago', read: true, type: 'warning' },
  ]);

  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const addRecentlyViewed = (id: string) => {
    setUserData(prev => ({
      ...prev,
      recentlyViewed: [id, ...prev.recentlyViewed.filter(i => i !== id)].slice(0, 5)
    }));
  };

  const toggleDarkMode = () => {
    setUserData(prev => ({
      ...prev,
      preferences: { ...prev.preferences, darkMode: !prev.preferences.darkMode }
    }));
    document.body.classList.toggle('dark');
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
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
