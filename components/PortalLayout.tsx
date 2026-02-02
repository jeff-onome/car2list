
import React from 'react';
import Sidebar from './Sidebar';
import { useUserData } from '../context/UserDataContext';

interface PortalLayoutProps {
  children: React.ReactNode;
}

const PortalLayout: React.FC<PortalLayoutProps> = ({ children }) => {
  const { isSidebarCollapsed } = useUserData();

  return (
    <div className="min-h-screen bg-black flex">
      {/* Vertical Sidebar */}
      <Sidebar />

      {/* Main Content Container */}
      <div className={`flex-grow transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <main className="pt-24 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PortalLayout;
