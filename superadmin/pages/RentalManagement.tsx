
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dbService } from '../../services/database';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { useCars } from '../../context/CarContext';
import { Rental } from '../../types';
import LoadingScreen from '../../components/LoadingScreen';

const RentalManagement: React.FC = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { formatPrice } = useSiteConfig();
  const { cars } = useCars();

  useEffect(() => {
    const unsub = dbService.subscribeToAllRentals((data) => {
      setRentals(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold uppercase tracking-tighter">Experience Registry</h1>
          <p className="text-zinc-500 uppercase text-[10px] tracking-widest font-bold mt-2">Platform-Wide Rental Governance & Inspection</p>
        </header>

        <div className="space-y-4">
          {rentals.length > 0 ? rentals.map(r => {
            const isExpanded = expandedId === r.id;
            const rentedCar = cars.find(c => c.id === r.carId);
            
            return (
              <div 
                key={r.id} 
                onClick={() => toggleExpand(r.id)}
                className={`glass p-5 md:p-6 rounded-[1.5rem] border transition-all duration-500 cursor-pointer active:scale-[0.99] ${isExpanded ? 'bg-white/[0.05] border-white/20' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div className="flex gap-4 sm:gap-6 items-center w-full sm:w-auto">
                    <div className="w-16 h-12 rounded-lg bg-zinc-900 overflow-hidden border border-white/5 shrink-0 shadow-xl">
                       {rentedCar?.images?.[0] ? (
                         <img src={rentedCar.images[0]} className="w-full h-full object-cover" alt={r.carName} />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-zinc-500">
                           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                         </div>
                       )}
                    </div>
                    <div className="overflow-hidden flex-grow">
                       <h3 className="text-sm font-bold uppercase text-white tracking-tight truncate">{r.carName}</h3>
                       <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[7px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
                            r.status === 'Accepted' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                            r.status === 'Cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          }`}>{r.status}</span>
                          <span className="text-[9px] text-zinc-500 font-bold uppercase truncate tracking-widest">{r.userName}</span>
                       </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-10 w-full sm:w-auto border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
                     <div className="text-left sm:text-right">
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-0.5">Start Date</p>
                        <p className="text-zinc-300 font-mono text-xs">{new Date(r.startDate).toLocaleDateString()}</p>
                     </div>
                     <div className="flex items-center gap-4">
                        <Link 
                          to={`/admin/rentals/${r.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-white text-black px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-xl"
                        >
                          Manage
                        </Link>
                        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                           <svg className="w-5 h-5 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                     </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
                     <div className="space-y-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Identity Audit</p>
                        <div className="space-y-1">
                           <p className="text-xs text-white font-bold">{r.userName}</p>
                           <p className="text-[10px] text-zinc-500 lowercase font-mono truncate">{r.userEmail}</p>
                           <p className="text-[8px] text-zinc-700 uppercase font-bold mt-2">Internal UUID: {r.id}</p>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Logistic Spec</p>
                        <div className="space-y-2">
                           <div className="flex justify-between text-[10px]">
                              <span className="text-zinc-600 uppercase font-bold">Lease Term</span>
                              <span className="text-white">{r.duration} Days</span>
                           </div>
                           <div className="flex justify-between text-[10px]">
                              <span className="text-zinc-600 uppercase font-bold">Drop Point</span>
                              <span className="text-white truncate max-w-[140px]">{r.location || 'Private Port'}</span>
                           </div>
                        </div>
                     </div>
                     <div className="space-y-4 sm:col-span-2 lg:col-span-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Financial Deck</p>
                        <div className="space-y-2">
                           <div className="flex justify-between text-[10px]">
                              <span className="text-zinc-600 uppercase font-bold">Registry Value</span>
                              <span className="text-white font-bold">{formatPrice(r.totalPrice)}</span>
                           </div>
                           <div className="flex justify-between text-[10px] pt-1 border-t border-white/5 mt-1">
                              <span className="text-zinc-600 uppercase font-bold">Channel</span>
                              <span className="text-zinc-400 tracking-tighter">Verified Member Ledger</span>
                           </div>
                        </div>
                     </div>
                  </div>
                )}
              </div>
            );
          }) : (
            <div className="glass p-32 rounded-[4rem] text-center border-white/5">
               <p className="text-zinc-600 uppercase text-[10px] tracking-[0.3em] italic">No experiences logged in the registry.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RentalManagement;
