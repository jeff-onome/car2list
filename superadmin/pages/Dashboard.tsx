
import React, { useState, useEffect } from 'react';
import { useCars } from '../../context/CarContext';
import { dbService } from '../../services/database';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { User } from '../../types';

const AdminDashboard: React.FC = () => {
  const { cars } = useCars();
  const { formatPrice, config } = useSiteConfig();
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const pendingCount = cars.filter(c => c.status === 'pending').length;

  useEffect(() => {
    const unsubUsers = dbService.subscribeToUsers(setUsers);
    const unsubBookings = dbService.subscribeToAllBookings(setBookings);
    return () => {
      unsubUsers();
      unsubBookings();
    };
  }, []);

  const totalVolume = cars.reduce((acc, c) => acc + c.price, 0);
  const dealerCount = new Set(cars.map(c => c.dealerId)).size;

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold uppercase tracking-tighter mb-12">Master Control</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <Stat label="Global Users" value={users.length.toLocaleString()} />
          <Stat label={`Total Volume (${config.activeCurrency})`} value={formatPrice(totalVolume)} />
          <Stat label="Pending Moderation" value={pendingCount.toString()} highlight={pendingCount > 0} />
          <Stat label="Live Reservations" value={bookings.length.toString()} highlight={bookings.length > 0} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
           <div className="lg:col-span-2 glass p-8 rounded-[3rem] border-white/5 flex flex-col min-h-[500px]">
              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                 <h3 className="text-sm font-bold uppercase tracking-widest text-white">Experience Registry</h3>
                 <span className="text-[10px] text-zinc-600 font-mono">Global Rental Pulse</span>
              </div>
              <div className="flex-grow overflow-y-auto no-scrollbar space-y-4">
                 {bookings.length > 0 ? bookings.map(b => (
                   <div key={b.id} className="glass bg-white/[0.02] p-6 rounded-[2rem] border-white/5 flex justify-between items-center group hover:bg-white/[0.04] transition-all">
                      <div className="flex gap-6 items-center">
                         <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500 group-hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                         </div>
                         <div>
                            <div className="flex items-center gap-2">
                               <p className="text-sm font-bold text-white uppercase tracking-tight">{b.car}</p>
                               <span className={`px-1.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-widest border ${b.bookingType === 'Test Drive' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                  {b.bookingType || 'Rental'}
                               </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                               <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">{b.userName}</p>
                               <span className="w-1 h-1 rounded-full bg-zinc-800" />
                               <p className="text-[9px] text-zinc-600 uppercase tracking-widest">via {b.dealerName}</p>
                            </div>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] text-zinc-400 font-mono">{new Date(b.date).toLocaleDateString()}</p>
                         <p className={`text-[8px] font-bold uppercase tracking-widest mt-1 ${b.securityOption === 'Yes' ? 'text-amber-500' : 'text-zinc-600'}`}>
                            {b.securityOption === 'Yes' ? 'Armed Detail' : 'Standard'}
                         </p>
                      </div>
                   </div>
                 )) : (
                   <div className="flex flex-col items-center justify-center h-full opacity-30 italic uppercase tracking-[0.2em] text-[10px]">Registry Empty</div>
                 )}
              </div>
           </div>

           <div className="space-y-8">
              <div className="glass p-8 rounded-[2.5rem] border-white/5">
                <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-zinc-400">Moderation Queue</h3>
                <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar">
                  {cars.filter(c => c.status === 'pending').map(c => (
                    <div key={c.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex justify-between items-center">
                      <span className="text-[10px] font-bold text-white truncate">{c.make} {c.model}</span>
                      <span className="text-[8px] text-zinc-600">{new Date(c.createdAt || '').toLocaleDateString()}</span>
                    </div>
                  ))}
                  {pendingCount === 0 && <p className="text-[9px] text-zinc-700 text-center uppercase py-10">Queue Clear</p>}
                </div>
              </div>
              
              <div className="glass p-8 rounded-[2.5rem] border-white/5">
                <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-zinc-400">Member Logs</h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
                  {users.slice(-10).reverse().map(u => (
                    <div key={u.id} className="flex justify-between items-center text-[10px] border-b border-white/5 pb-2">
                      <span className="text-zinc-300 font-bold">{u.name}</span>
                      <span className="text-zinc-600 uppercase text-[8px]">{u.role}</span>
                    </div>
                  ))}
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className={`glass p-6 rounded-2xl border ${highlight ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/5'}`}>
    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-bold">{label}</p>
    <p className={`text-2xl font-bold tracking-tight ${highlight ? 'text-amber-400' : 'text-white'}`}>{value}</p>
  </div>
);

export default AdminDashboard;
