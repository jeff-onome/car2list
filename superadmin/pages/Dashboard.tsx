
import React, { useState, useEffect } from 'react';
import { useCars } from '../../context/CarContext';
import { dbService } from '../../services/database';
import { User } from '../../types';

const AdminDashboard: React.FC = () => {
  const { cars } = useCars();
  const [users, setUsers] = useState<User[]>([]);
  const pendingCount = cars.filter(c => c.status === 'pending').length;

  useEffect(() => {
    const unsubscribe = dbService.subscribeToUsers(setUsers);
    return () => unsubscribe();
  }, []);

  const totalVolume = cars.reduce((acc, c) => acc + c.price, 0);
  const dealerCount = new Set(cars.map(c => c.dealerId)).size;

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold uppercase tracking-tighter mb-12">Master Control</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <Stat label="Global Users" value={users.length.toLocaleString()} />
          <Stat label="Total Volume" value={`$${(totalVolume / 1000000).toFixed(1)}M`} />
          <Stat label="Pending Moderation" value={pendingCount.toString()} highlight={pendingCount > 0} />
          <Stat label="Active Dealers" value={dealerCount.toString()} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass p-8 rounded-3xl min-h-[400px]">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-white/5 pb-2 text-zinc-400">Moderation Activity</h3>
            <div className="space-y-4">
              {cars.filter(c => c.status === 'pending').slice(0, 8).map(c => (
                <ActivityItem 
                  key={c.id} 
                  text={`Review Required: ${c.make} ${c.model}`} 
                  time={c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'} 
                />
              ))}
              {pendingCount === 0 && (
                <div className="flex flex-col items-center justify-center h-[250px] text-zinc-600 italic uppercase text-[10px] tracking-widest">
                  <svg className="w-8 h-8 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Queue is clear.
                </div>
              )}
            </div>
          </div>
          <div className="glass p-8 rounded-3xl min-h-[400px] flex flex-col">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-white/5 pb-2 text-zinc-400">Live Member Logs</h3>
            <div className="flex-grow space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
              {users.slice(-10).reverse().map(u => (
                <div key={u.id} className="flex justify-between items-center text-[10px] uppercase tracking-widest text-zinc-500 border-b border-white/5 pb-2">
                  <span className="text-white font-bold">{u.name}</span>
                  <span>Joined {new Date(u.joinedAt).toLocaleDateString()}</span>
                </div>
              ))}
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
    <p className={`text-2xl font-bold ${highlight ? 'text-amber-400' : 'text-white'}`}>{value}</p>
  </div>
);

const ActivityItem: React.FC<{ text: string; time: string }> = ({ text, time }) => (
  <div className="flex justify-between items-center text-xs p-3 hover:bg-white/5 rounded-xl transition-colors border border-white/5">
    <span className="text-zinc-300 font-bold uppercase tracking-tight">{text}</span>
    <span className="text-zinc-600 uppercase text-[9px]">{time}</span>
  </div>
);

export default AdminDashboard;
