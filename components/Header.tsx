
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../context/UserDataContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { NAV_LINKS } from '../constants';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { config } = useSiteConfig();
  const { 
    toggleDarkMode, 
    isSidebarCollapsed, 
    setSidebarCollapsed, 
    setMobileSidebarOpen, 
    isMobileSidebarOpen,
    notifications,
    markNotificationAsRead,
    clearNotifications
  } = useUserData();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifyRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const unreadCount = notifications.filter(n => !n.read).length;

  const isPortal = location.pathname.startsWith('/user') || 
                   location.pathname.startsWith('/dealer') || 
                   location.pathname.startsWith('/admin');

  const linksToDisplay = isPortal ? [] : NAV_LINKS;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notifyRef.current && !notifyRef.current.contains(event.target as Node)) {
        setIsNotifyOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  const handleSidebarToggle = () => {
    if (window.innerWidth >= 1024) {
      setSidebarCollapsed(!isSidebarCollapsed);
    } else {
      setMobileSidebarOpen(!isMobileSidebarOpen);
    }
  };

  const getSecurityPath = () => {
    if (!user) return '/';
    return `/${user.role.toLowerCase()}/security`;
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'JUST NOW';
      if (diffMins < 60) return `${diffMins}M AGO`;
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)}H AGO`;
      return date.toLocaleDateString();
    } catch (e) {
      return 'ARCHIVE';
    }
  };

  const markAllRead = () => {
    notifications.forEach(n => {
      if (!n.read) markNotificationAsRead(n.id);
    });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 h-16 flex items-center px-4 md:px-12 justify-between backdrop-blur-2xl">
      <div className="flex items-center space-x-4">
        {isPortal && (
          <button 
            onClick={handleSidebarToggle}
            className="p-2 hover:bg-white/5 rounded-full text-zinc-400 transition-colors"
            aria-label="Toggle Sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        )}
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold tracking-tighter gradient-text uppercase">{config.siteName}</span>
        </Link>
      </div>

      <nav className="hidden lg:flex items-center space-x-8">
        {linksToDisplay.map(link => (
          <Link 
            key={link.path} 
            to={link.path} 
            className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:text-white ${location.pathname === link.path ? 'text-white' : 'text-zinc-500'}`}
          >
            {link.name}
          </Link>
        ))}
      </nav>

      <div className="flex items-center space-x-3">
        <button onClick={toggleDarkMode} className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        </button>

        {isAuthenticated && (
          <div className="relative" ref={notifyRef}>
            <button 
              onClick={() => setIsNotifyOpen(!isNotifyOpen)}
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 relative"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-white rounded-full border border-black animate-pulse"></span>
              )}
            </button>

            {isNotifyOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-zinc-950 rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[100]">
                <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-white">Registry Alerts</h4>
                  <div className="flex gap-4">
                    <button onClick={markAllRead} className="text-[8px] text-zinc-500 uppercase font-bold hover:text-white transition-colors">Mark All Read</button>
                    <button onClick={clearNotifications} className="text-[8px] text-zinc-700 uppercase font-bold hover:text-red-400 transition-colors">Flush</button>
                  </div>
                </div>
                <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`p-5 hover:bg-white/[0.03] transition-colors cursor-pointer border-b border-white/5 group ${!n.read ? 'bg-white/[0.01]' : 'opacity-40'}`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type === 'success' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : n.type === 'warning' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]'}`} />
                          <div className="space-y-1">
                            <p className="text-xs font-bold uppercase tracking-tight text-white group-hover:text-white transition-colors">{n.title}</p>
                            <p className="text-[10px] text-zinc-500 leading-relaxed uppercase tracking-tighter">{n.message}</p>
                            <div className="flex items-center gap-2 pt-2">
                               <span className="text-[8px] font-mono text-zinc-600 font-bold">{formatTime(n.time)}</span>
                               {!n.read && <span className="text-[7px] bg-white/10 text-white px-1.5 rounded-full font-bold">UNREAD</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-16 text-center">
                      <svg className="w-10 h-10 text-zinc-900 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                      <p className="text-[9px] text-zinc-700 uppercase tracking-widest font-bold">No active pulses identified</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {isAuthenticated ? (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 p-1 rounded-full border border-white/5 hover:bg-white/5 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white border border-white/5 overflow-hidden">
                {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user?.name.charAt(0)}
              </div>
              <svg className={`w-4 h-4 text-zinc-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-zinc-950 rounded-2xl border border-white/10 shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-3 border-b border-white/5 mb-1">
                  <p className="text-xs font-bold text-white uppercase tracking-tighter truncate">{user?.name}</p>
                  <p className="text-[8px] text-zinc-600 uppercase font-bold tracking-widest mt-1">{user?.role} ACCESS</p>
                </div>
                <DropdownItem to={user?.role === 'ADMIN' ? '/admin/dashboard' : user?.role === 'DEALER' ? '/dealer/dashboard' : '/user/overview'} icon="M4 6h16M4 12h16M4 18h16" label="Dashboard" onClick={() => setIsDropdownOpen(false)} />
                <DropdownItem to={getSecurityPath()} icon="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" label="Security" onClick={() => setIsDropdownOpen(false)} />
                <div className="border-t border-white/5 mt-1 pt-1">
                  <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-red-500/60 hover:text-red-400 hover:bg-white/5 transition-all text-left">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    <span>Terminate Session</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link 
            to="/login" 
            className="p-2.5 hover:bg-white/5 rounded-full transition-colors text-zinc-500 border border-white/10 flex items-center justify-center"
            aria-label="Sign In"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>
        )}
        
        {!isPortal && (
          <button className="lg:hidden p-2 text-zinc-400" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle Menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        )}
      </div>

      {isMenuOpen && !isPortal && (
        <div className="absolute top-16 left-0 right-0 bg-zinc-950 border-b border-white/10 flex flex-col p-8 space-y-6 lg:hidden animate-in slide-in-from-top-2 shadow-2xl">
          {linksToDisplay.map(link => (
            <Link 
              key={link.path} 
              to={link.path} 
              onClick={() => setIsMenuOpen(false)} 
              className={`text-sm font-bold uppercase tracking-widest transition-colors ${location.pathname === link.path ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              {link.name}
            </Link>
          ))}
          {!isAuthenticated && (
            <Link 
              to="/login" 
              onClick={() => setIsMenuOpen(false)} 
              className="bg-white/5 border border-white/10 text-white py-4 rounded-xl font-bold text-center uppercase tracking-widest text-xs flex items-center justify-center gap-3"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

const DropdownItem: React.FC<{ to: string, icon: string, label: string, onClick: () => void }> = ({ to, icon, label, onClick }) => (
  <Link to={to} onClick={onClick} className="flex items-center space-x-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/5 transition-all">
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} /></svg>
    <span>{label}</span>
  </Link>
);

export default Header;
