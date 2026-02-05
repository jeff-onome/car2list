
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
  const { isSidebarCollapsed, isMobileSidebarOpen, setMobileSidebarOpen } = useUserData();
  const { cars } = useCars();
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
      { name: 'Showroom', path: '/inventory', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
    ];

    if (user?.role === 'ADMIN') {
      const kycPending = users.filter(u => u.kycDocuments && (u.kycStatus === 'pending' || !u.kycStatus)).length;
      const rentalPending = rentals.filter(r => r.status === 'Pending').length;
      const paymentPending = payments.filter(p => p.status === 'Pending').length;

      return [
        ...commonLinks,
        { name: 'Control', path: '/admin/dashboard', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
        { name: 'Rentals', path: '/admin/rentals', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', badge: rentalPending, badgeColor: 'bg-amber-500 text-black' },
        { name: 'Payments', path: '/admin/payments', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', badge: paymentPending, badgeColor: 'bg-green-500 text-white' },
        { name: 'Registry', path: '/admin/users', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7', badge: kycPending, badgeColor: 'bg-white text-black' },
        { name: 'Site CMS', path: '/admin/cms', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828' },
      ];
    }
    
    if (user?.role === 'DEALER') {
      return [
        ...commonLinks,
        { name: 'Hub', path: '/dealer/dashboard', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z' },
        { name: 'My Fleet', path: '/dealer/listings', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5' },
        { name: 'Add Entry', path: '/dealer/add-car', icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z' },
      ];
    }

    return [
      ...commonLinks,
      { name: 'Overview', path: '/user/overview', icon: 'M9 19v-6a2 2 0 00-2-2H5' },
      { name: 'Garage', path: '/user/garage', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10' },
      { name: 'Rentals', path: '/user/rentals', icon: 'M8 7V3m8 4V3m-9 8h10' },
      { name: 'Acquisitions', path: '/user/purchases', icon: 'M16 11V7a4 4 0 00-8 0v4' },
      { name: 'Identity', path: '/user/profile', icon: 'M16 7a4 4 0 11-8 0' },
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
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon} /></svg>
                </div>
                {!isSidebarCollapsed && (
                  <div className="flex justify-between items-center w-full ml-4">
                    <span className="text-[10px] uppercase font-bold tracking-widest">{link.name}</span>
                    {link.badge !== undefined && link.badge > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${link.badgeColor}`}>{link.badge}</span>
                    )}
                  </div>
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
               <Link key={link.path} to={link.path} onClick={() => setMobileSidebarOpen(false)} className="flex items-center p-4 rounded-2xl text-zinc-500 hover:text-white">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon} /></svg>
                 <span className="ml-4 text-[10px] uppercase font-bold tracking-widest">{link.name}</span>
               </Link>
             ))}
           </div>
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
