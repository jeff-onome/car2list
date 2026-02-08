
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../context/UserDataContext';
import { useCars } from '../context/CarContext';
import { dbService } from '../services/database';
import { User, Rental, Payment } from '../types';

interface SidebarLink {
  name: string;
  path: string;
  icon: string;
  badge?: number;
  badgeColor?: string;
}

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { isSidebarCollapsed, isMobileSidebarOpen, setMobileSidebarOpen, notifications } = useUserData();
  const location = useLocation();
  const [users, setUsers] = useState<User[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      const u1 = dbService.subscribeToUsers(setUsers);
      const u2 = dbService.subscribeToAllRentals(setRentals);
      const u3 = dbService.subscribeToAllPayments(setPayments);
      return () => { u1(); u2(); u3(); };
    }
  }, [user?.role]);

  const getLinks = (): SidebarLink[] => {
    const commonLinks: SidebarLink[] = [
      { name: 'Showroom', path: '/inventory', icon: 'M11 19a8 8 0 100-16 8 8 0 000 16z M21 21l-4.35-4.35' },
    ];

    if (user?.role === 'ADMIN') {
      const kycPending = users.filter(u => u.kycDocuments && (u.kycStatus === 'pending' || !u.kycStatus)).length;
      const rentalPending = rentals.filter(r => r.status === 'Pending').length;
      const paymentPending = payments.filter(p => p.status === 'Pending').length;

      return [
        ...commonLinks,
        { name: 'Control', path: '/admin/dashboard', icon: 'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z' },
        { name: 'Cars List', path: '/admin/cars-list', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
        { name: 'Identity', path: '/admin/kyc', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', badge: kycPending, badgeColor: 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]' },
        { name: 'Rentals', path: '/admin/rentals', icon: 'M4 7V4a2 2 0 012-2h12a2 2 0 012 2v3M9 2v4M15 2v4M3 11h18M5 19v2M19 19v2M3 11v8a2 2 0 002 2h14a2 2 0 002-2v-8', badge: rentalPending, badgeColor: 'bg-amber-500 text-black' },
        { name: 'Payments', path: '/admin/payments', icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6', badge: paymentPending, badgeColor: 'bg-green-500 text-white' },
        { name: 'Add Car', path: '/admin/add-car', icon: 'M12 5v14M5 12h14' },
        { name: 'Deal', path: '/admin/deal', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
        { name: 'Registry', path: '/admin/users', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75' },
        { name: 'Site CMS', path: '/admin/cms', icon: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z' },
      ];
    }
    
    if (user?.role === 'DEALER') {
      return [
        ...commonLinks,
        { name: 'Hub', path: '/dealer/dashboard', icon: 'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z' },
        { name: 'My Fleet', path: '/dealer/listings', icon: 'M21 8l-9-4-9 4v8l9 4 9-4V8z M12 22V12 M21 8l-9 4-9-4' },
        { name: 'Add Entry', path: '/dealer/add-car', icon: 'M12 5v14M5 12h14' },
      ];
    }

    const unreadMessages = notifications.filter(n => !n.read && (n.title.includes('Administrative') || n.title.includes('[SYSTEM]'))).length;

    return [
      ...commonLinks,
      { name: 'Overview', path: '/user/overview', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' },
      { name: 'Garage', path: '/user/garage', icon: 'M21 7V3a2 2 0 00-2-2H5a2 2 0 00-2 2v4M21 17v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 12a5 5 0 11-10 0 5 5 0 0110 0z' },
      { name: 'Rentals', path: '/user/rentals', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
      { name: 'Acquisitions', path: '/user/purchases', icon: 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z M3 6h18 M16 10a4 4 0 01-8 0' },
      { name: 'Messages', path: '/user/messages', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', badge: unreadMessages, badgeColor: 'bg-red-500 text-white' },
      { name: 'Identity', path: '/user/profile', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z' },
    ];
  };

  const links = getLinks();

  return (
    <>
      <aside className={`fixed left-0 top-16 bottom-0 z-40 glass border-r border-white/5 transition-all duration-300 hidden lg:flex flex-col ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="flex-grow p-4 space-y-2 overflow-y-auto no-scrollbar">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link key={link.path} to={link.path} className={`flex items-center p-4 rounded-2xl transition-all whitespace-nowrap relative ${isActive ? 'bg-white text-black shadow-xl' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
                <div className="shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon} />
                  </svg>
                </div>
                {!isSidebarCollapsed && (
                  <div className="flex justify-between items-center w-full ml-4">
                    <span className="text-[10px] uppercase font-bold tracking-widest">{link.name}</span>
                    {link.badge !== undefined && link.badge > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${link.badgeColor}`}>{link.badge}</span>
                    )}
                  </div>
                )}
                {isSidebarCollapsed && link.badge !== undefined && link.badge > 0 && (
                  <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${link.badgeColor.split(' ')[0]} animate-pulse border border-black`} />
                )}
              </Link>
            );
          })}
        </div>
      </aside>

      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${isMobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
        <aside className={`absolute left-0 top-0 bottom-0 w-64 bg-zinc-950 border-r border-white/10 transition-transform duration-300 transform ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
           <div className="p-4 space-y-2">
             {links.map(link => (
               <Link key={link.path} to={link.path} onClick={() => setMobileSidebarOpen(false)} className="flex items-center p-4 rounded-2xl text-zinc-500 hover:text-white relative">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon} />
                 </svg>
                 <span className="ml-4 text-[10px] uppercase font-bold tracking-widest">{link.name}</span>
                 {link.badge !== undefined && link.badge > 0 && (
                    <span className={`ml-auto px-2 py-0.5 rounded-full text-[8px] font-bold ${link.badgeColor}`}>{link.badge}</span>
                 )}
               </Link>
             ))}
           </div>
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
