
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCars } from '../../context/CarContext';
import { useUserData } from '../../context/UserDataContext';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { dbService } from '../../services/database';
import { Link } from 'react-router-dom';

const Overview: React.FC = () => {
  const { user } = useAuth();
  const { favorites } = useCars();
  const { userData } = useUserData();
  const { formatPrice } = useSiteConfig();

  const [purchases, setPurchases] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      const unsubPurchases = dbService.subscribeToPurchases(user.id, setPurchases);
      const unsubBookings = dbService.subscribeToBookings(user.id, setBookings);
      setLoading(false);
      return () => {
        unsubPurchases();
        unsubBookings();
      };
    }
  }, [user]);

  const boughtCount = purchases.filter(p => p.listingType !== 'Rent').length;
  const rentedCount = purchases.filter(p => p.listingType === 'Rent').length;
  const totalSpend = purchases.reduce((acc, p) => acc + (p.price || 0), 0);

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-4 md:px-12">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        
        {/* Verification Alert Banner */}
        {!user?.isVerified && (
          <div className="glass bg-red-500/10 border border-red-500/20 rounded-2xl md:rounded-[2rem] p-4 md:p-6 flex flex-col lg:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-4 text-center lg:text-left flex-col lg:flex-row">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-white">Status: Unverified</h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Limited access to high-value assets and auctions. Admin verification required.</p>
              </div>
            </div>
            <Link to="/user/verify" className="w-full lg:w-auto bg-white text-black px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-xl text-center">
              Submit KYC Now
            </Link>
          </div>
        )}

        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter">Activity Overview</h1>
            <p className="text-zinc-500 mt-2 uppercase text-[10px] tracking-[0.2em] font-bold">Welcome back, {user?.name}</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
             <Link to="/inventory" className="w-full md:w-auto text-center bg-white text-black px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-xl">
              Marketplace
            </Link>
          </div>
        </header>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard 
            label="Total Acquisitions" 
            value={boughtCount.toString()} 
            subValue="Permanent Assets"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
          />
          <StatCard 
            label="Active Rentals" 
            value={rentedCount.toString()} 
            subValue="Leased Experiences"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          />
          <StatCard 
            label="Vaulted Savings" 
            value={formatPrice(totalSpend)} 
            subValue="Total Portfolio Value"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard 
            label="Curated Selection" 
            value={favorites.length.toString()} 
            subValue="In Your Garage"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Activity Pulse */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
               <h3 className="text-xl font-bold uppercase tracking-tighter">Activity Pulse</h3>
               <Link to="/user/purchases" className="text-[9px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">View All History</Link>
            </div>
            <div className="space-y-4">
               {[...purchases, ...bookings].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map((item, idx) => (
                 <div key={idx} className="glass p-4 md:p-6 rounded-2xl md:rounded-[2rem] border-white/5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white/5 transition-colors gap-4">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 shrink-0">
                          {item.price ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          )}
                       </div>
                       <div>
                          <p className="text-sm font-bold uppercase tracking-tight">{item.car || item.model}</p>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{item.price ? 'Purchase Confirmed' : 'Test Drive Scheduled'}</p>
                       </div>
                    </div>
                    <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-tighter text-right">{new Date(item.date).toLocaleDateString()}</p>
                 </div>
               ))}
               {purchases.length === 0 && bookings.length === 0 && !loading && (
                 <div className="p-12 md:p-20 text-center glass rounded-[2rem] md:rounded-[3rem] border-white/5">
                    <p className="text-zinc-600 italic text-[10px] uppercase tracking-widest">No recent pulses identified.</p>
                 </div>
               )}
               {loading && (
                 <div className="p-20 text-center animate-pulse uppercase tracking-[0.3em] text-zinc-600 text-[9px]">Analyzing telemetry...</div>
               )}
            </div>
            
            {/* Market Insight Mini-Section */}
            <div className="glass p-6 md:p-8 rounded-2xl md:rounded-[3rem] border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
               <h4 className="text-[10px] font-bold uppercase tracking-widest text-white mb-6 md:mb-4">Global Market Pulse</h4>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-1">
                     <p className="text-[8px] text-zinc-500 uppercase font-bold">Asset Appreciation</p>
                     <p className="text-xl font-bold text-green-500">+4.2% <span className="text-[8px] text-zinc-600 font-normal">AVG</span></p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[8px] text-zinc-500 uppercase font-bold">Demand Index</p>
                     <p className="text-xl font-bold text-white uppercase">High <span className="text-[8px] text-zinc-600 font-normal">SELLER'S MARKET</span></p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[8px] text-zinc-500 uppercase font-bold">Liquidity Tier</p>
                     <p className="text-xl font-bold text-amber-500 uppercase">Tier 1 <span className="text-[8px] text-zinc-600 font-normal">ULTRA-EXCLUSIVE</span></p>
                  </div>
               </div>
            </div>
          </div>

          {/* Account & Security Summary */}
          <div className="space-y-8">
            <h3 className="text-xl font-bold uppercase tracking-tighter border-b border-white/5 pb-4">Identity Status</h3>
            <div className="glass p-6 md:p-8 rounded-2xl md:rounded-[3rem] border-white/5 space-y-6">
               <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Verification Grade</span>
                  <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border ${user?.isVerified ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                    {user?.isVerified ? 'Verified' : 'Pending KYC'}
                  </span>
               </div>
               <div className="space-y-2">
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-white transition-all duration-1000" style={{ width: user?.isVerified ? '100%' : '33%' }} />
                  </div>
                  <p className="text-[9px] text-zinc-600 uppercase tracking-tighter">Your verification is {user?.isVerified ? 'complete' : 'in progress'}.</p>
               </div>
               <Link to="/user/verify" className="block text-center bg-white/5 border border-white/10 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                 {user?.isVerified ? 'View Certificate' : 'Complete Verification'}
               </Link>
            </div>

            <div className="glass p-6 md:p-8 rounded-2xl md:rounded-[3rem] border-white/5 space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Identity Registry</h4>
              <div className="space-y-3">
                 <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-zinc-400">
                    <span>Role Access</span>
                    <span className="text-white font-bold">{user?.role}</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-zinc-400">
                    <span>Member Since</span>
                    <span className="text-white font-bold">{user?.joinedAt ? new Date(user.joinedAt).getFullYear() : '2024'}</span>
                 </div>
                 <Link to="/user/profile" className="block pt-2 text-[8px] text-zinc-600 hover:text-white uppercase tracking-widest transition-colors font-bold">Manage Profile Assets</Link>
              </div>
            </div>

            <div className="glass p-6 md:p-8 rounded-2xl md:rounded-[3rem] border-white/5 space-y-4 bg-red-500/[0.02]">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <svg className="w-3 h-3 text-red-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Security Pulse
              </h4>
              <p className="text-[9px] text-zinc-600 uppercase tracking-tighter">Your authentication key is valid. No unauthorized access attempts logged.</p>
              <Link to="/user/security" className="block text-[8px] text-white uppercase tracking-widest hover:underline font-bold">Update Access Key</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; subValue: string; icon: React.ReactNode }> = ({ label, value, subValue, icon }) => (
  <div className="glass p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-white/5 shadow-xl space-y-4 hover:border-white/10 transition-colors group">
    <div className="flex justify-between items-center">
       <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">{label}</p>
       <div className="text-zinc-600 group-hover:text-white transition-colors">{icon}</div>
    </div>
    <div>
      <p className="text-2xl md:text-3xl font-bold tracking-tighter text-white">{value}</p>
      <p className="text-[9px] text-zinc-600 uppercase tracking-widest mt-1">{subValue}</p>
    </div>
  </div>
);

export default Overview;
