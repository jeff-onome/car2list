
import React from 'react';
import Sidebar from './Sidebar';
import { useUserData } from '../context/UserDataContext';

interface PortalLayoutProps {
  children: React.ReactNode;
}

const PortalLayout: React.FC<PortalLayoutProps> = ({ children }) => {
  const { isSidebarCollapsed } = useUserData();

  return (
    <div className="min-h-screen bg-black flex w-full">
      {/* Vertical Sidebar */}
      <Sidebar />

      {/* Main Content Container */}
      <div className={`flex-grow transition-all duration-300 w-full ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <main className="pt-20 md:pt-24 min-h-screen w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PortalLayout;
