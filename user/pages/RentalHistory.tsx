
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { dbService } from '../../services/database';
import { Rental } from '../../types';
import LoadingScreen from '../../components/LoadingScreen';

const RentalHistory: React.FC = () => {
  const { user } = useAuth();
  const { formatPrice, isLoading: configLoading } = useSiteConfig();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      const unsub = dbService.subscribeToUserRentals(user.id, (data) => {
        setRentals(data);
        setLoading(false);
      });
      return () => unsub();
    }
  }, [user]);

  if (loading || configLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold uppercase tracking-tighter mb-12">Experience Log</h1>
        
        {rentals.length > 0 ? (
          <div className="grid gap-6">
            {rentals.map(r => (
              <div key={r.id} className="glass p-8 rounded-[2.5rem] border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 group hover:bg-white/[0.02] transition-all">
                <div className="flex gap-6 items-center">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-500 border border-white/5 group-hover:text-white transition-colors">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight">{r.carName}</h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Starting: {new Date(r.startDate).toLocaleDateString()} • {r.duration} Days</p>
                  </div>
                </div>
                <div className="flex items-center gap-12">
                   <div className="text-center md:text-right">
                      <p className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold mb-1">Status</p>
                      <span className={`px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                        r.status === 'Accepted' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        r.status === 'Cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>{r.status}</span>
                   </div>
                   <div className="text-right">
                      <p className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold mb-1">Valuation</p>
                      <p className="text-lg font-bold font-mono">{formatPrice(r.totalPrice)}</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass p-20 rounded-[4rem] text-center border-white/5 text-zinc-600 uppercase text-[10px] italic">No active or past rentals.</div>
        )}
      </div>
    </div>
  );
};

export default RentalHistory;
