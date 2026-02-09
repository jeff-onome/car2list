
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCars } from '../../context/CarContext';
import { useUserData } from '../../context/UserDataContext';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { dbService } from '../../services/database';
import { Link } from 'react-router-dom';
import LoadingScreen from '../../components/LoadingScreen';

const Overview: React.FC = () => {
  const { user } = useAuth();
  const { favorites, isLoading: carsLoading } = useCars();
  const { userData } = useUserData();
  const { formatPrice, isLoading: configLoading } = useSiteConfig();

  const [purchases, setPurchases] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      const unsubPurchases = dbService.subscribeToPurchases(user.id, (data) => {
        setPurchases(data);
        setDataLoading(false);
      });

      const unsubBookings = dbService.subscribeToBookings(user.id, (data) => {
        setBookings(data);
        setDataLoading(false);
      });

      return () => {
        unsubPurchases();
        unsubBookings();
      };
    }
  }, [user]);

  if (carsLoading || configLoading || dataLoading) return <LoadingScreen />;

  const boughtCount = purchases.filter(p => p.itemType === 'Purchase').length;
  const rentedCount = purchases.filter(p => p.itemType === 'Rental').length;
  const totalSpend = purchases.reduce((acc, p) => acc + (p.amount || 0), 0);

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-4 md:px-12">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        
        {/* Verification Alert Banner */}
        {!user?.isVerified && (
          <div className="glass bg-red-500/10 border border-red-500/20 rounded-2xl md:rounded-[2rem] p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 shrink-0 shadow-lg border border-red-500/10">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold uppercase tracking-widest text-white">Identity Verification Pending</h3>
                <p className="text-[11px] text-zinc-500 uppercase tracking-widest leading-relaxed max-w-lg">Limited access to high-value assets and auctions. Please provide valid documentation to unlock the full AutoSphere registry.</p>
              </div>
            </div>
            <Link to="/user/verify" className="w-full lg:w-auto bg-white text-black px-10 py-4 rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-xl text-center">
              Initialize Clearance
            </Link>
          </div>
        )}

        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter">Activity Overview</h1>
            <p className="text-zinc-500 mt-2 uppercase text-[10px] tracking-[0.2em] font-bold">Welcome back, {user?.name}</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
             <Link 
              to="/inventory" 
              className="w-full md:w-auto text-center bg-white text-black px-10 py-4 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all shadow-xl flex items-center justify-center gap-3 group"
             >
              <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              Browse Global Showroom
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
            <div className="flex justify-between items-center border-b border-white/5 pb-4 px-2">
               <h3 className="text-xl font-bold uppercase tracking-tighter">Activity Pulse</h3>
               <Link to="/user/purchases" className="text-[9px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">View All history</Link>
            </div>
            <div className="space-y-4">
               {[...purchases, ...bookings].sort((a,b) => {
                 const dateA = new Date(a.createdAt || a.date).getTime();
                 const dateB = new Date(b.createdAt || b.date).getTime();
                 return dateB - dateA;
               }).slice(0, 5).map((item, idx) => (
                 <div key={idx} className="glass p-5 md:p-6 rounded-2xl md:rounded-[2rem] border-white/5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white/5 transition-all gap-4 group">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 shrink-0 group-hover:text-white transition-colors">
                          {item.amount ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          )}
                       </div>
                       <div className="overflow-hidden">
                          <p className="text-sm font-bold uppercase tracking-tight truncate">{item.itemDescription || item.car}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                             <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{item.amount ? 'Payment' : 'Test Drive'}</p>
                             <span className="w-1 h-1 rounded-full bg-zinc-700" />
                             <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-tighter sm:hidden">{new Date(item.createdAt || item.date).toLocaleDateString()}</p>
                          </div>
                       </div>
                    </div>
                    <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-tighter text-right hidden sm:block">{new Date(item.createdAt || item.date).toLocaleDateString()}</p>
                 </div>
               ))}
               {purchases.length === 0 && bookings.length === 0 && (
                 <div className="p-12 md:p-20 text-center glass rounded-[2rem] md:rounded-[3rem] border-white/5">
                    <p className="text-zinc-600 italic text-[10px] uppercase tracking-widest">No recent pulses identified.</p>
                 </div>
               )}
            </div>
            
            {/* Market Insight Mini-Section */}
            <div className="glass p-6 md:p-10 rounded-2xl md:rounded-[3rem] border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
               <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-8 md:mb-6">Global Market Pulse</h4>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                  <div className="space-y-1">
                     <p className="text-[8px] text-zinc-600 uppercase font-bold tracking-widest">Asset Appreciation</p>
                     <p className="text-xl md:text-2xl font-bold text-green-500 tracking-tighter">+4.2% <span className="text-[8px] text-zinc-700 font-normal uppercase ml-1">Avg</span></p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[8px] text-zinc-600 uppercase font-bold tracking-widest">Demand Index</p>
                     <p className="text-xl md:text-2xl font-bold text-white uppercase tracking-tighter">High <span className="text-[8px] text-zinc-700 font-normal uppercase ml-1">Market</span></p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[8px] text-zinc-600 uppercase font-bold tracking-widest">Liquidity Tier</p>
                     <p className="text-xl md:text-2xl font-bold text-amber-500 uppercase tracking-tighter">Tier 1 <span className="text-[8px] text-zinc-700 font-normal uppercase ml-1">Elite</span></p>
                  </div>
               </div>
            </div>
          </div>

          {/* Account & Security Summary */}
          <div className="space-y-8">
            <h3 className="text-xl font-bold uppercase tracking-tighter border-b border-white/5 pb-4 px-2">Identity Status</h3>
            <div className="glass p-6 md:p-8 rounded-2xl md:rounded-[3rem] border-white/5 space-y-6">
               <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Verification Grade</span>
                  <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border ${user?.isVerified ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                    {user?.isVerified ? 'Verified' : 'Pending'}
                  </span>
               </div>
               <div className="space-y-2">
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                     <div className="h-full bg-white transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.3)]" style={{ width: user?.isVerified ? '100%' : '33%' }} />
                  </div>
                  <p className="text-[9px] text-zinc-600 uppercase tracking-tighter font-bold">{user?.isVerified ? 'Cleared for high-limit access' : 'Awaiting document validation'}</p>
               </div>
               <Link to="/user/verify" className="block text-center bg-white/5 border border-white/10 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                 {user?.isVerified ? 'Inspect Certificate' : 'Complete Verification'}
               </Link>
            </div>

            <div className="glass p-6 md:p-8 rounded-2xl md:rounded-[3rem] border-white/5 space-y-4 shadow-xl">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Identity Registry</h4>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-zinc-400">
                    <span className="font-medium">Registered Since</span>
                    <span className="text-white font-bold">{user?.joinedAt ? new Date(user.joinedAt).getFullYear() : '2024'}</span>
                 </div>
                 <Link to="/user/profile" className="block pt-2 text-[9px] text-zinc-600 hover:text-white uppercase tracking-widest transition-colors font-bold text-center sm:text-left">Manage Account Profile</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; subValue: string; icon: React.ReactNode }> = ({ label, value, subValue, icon }) => (
  <div className="glass p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-white/5 shadow-xl space-y-4 hover:border-white/10 transition-all group active:scale-[0.98]">
    <div className="flex justify-between items-center">
       <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">{label}</p>
       <div className="text-zinc-600 group-hover:text-white transition-colors">{icon}</div>
    </div>
    <div>
      <p className="text-2xl md:text-3xl font-bold tracking-tighter text-white truncate">{value}</p>
      <p className="text-[9px] text-zinc-600 uppercase tracking-widest mt-1 font-medium">{subValue}</p>
    </div>
  </div>
);

export default Overview;
