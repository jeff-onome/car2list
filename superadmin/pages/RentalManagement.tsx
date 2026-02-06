
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dbService } from '../../services/database';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { Rental } from '../../types';
import LoadingScreen from '../../components/LoadingScreen';

const RentalManagement: React.FC = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = dbService.subscribeToAllRentals((data) => {
      setRentals(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold uppercase tracking-tighter">Experience Registry</h1>
          <p className="text-zinc-500 uppercase text-[10px] tracking-widest font-bold mt-2">Platform-Wide Rental Governance</p>
        </header>

        <div className="glass rounded-[3rem] overflow-hidden border-white/5 shadow-2xl">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left">
               <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-zinc-500 border-b border-white/5">
                 <tr>
                   <th className="px-8 py-6">Asset</th>
                   <th className="px-8 py-6">ID / Identity</th>
                   <th className="px-8 py-6">Date</th>
                   <th className="px-8 py-6 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {rentals.length > 0 ? rentals.map(r => (
                   <tr key={r.id} className="text-sm hover:bg-white/[0.02] transition-colors">
                     <td className="px-8 py-6">
                        <p className="font-bold uppercase text-white tracking-tight">{r.carName}</p>
                        <p className={`text-[7px] font-bold uppercase tracking-widest mt-1 ${
                          r.status === 'Accepted' ? 'text-green-500' :
                          r.status === 'Cancelled' ? 'text-red-500' : 'text-amber-500'
                        }`}>{r.status}</p>
                     </td>
                     <td className="px-8 py-6">
                        <p className="text-zinc-300 font-bold uppercase tracking-tighter text-xs">{r.userName}</p>
                        <p className="text-[9px] font-mono text-zinc-600 mt-0.5">{r.id}</p>
                     </td>
                     <td className="px-8 py-6">
                        <p className="text-zinc-400 font-mono text-xs">{new Date(r.startDate).toLocaleDateString()}</p>
                        <p className="text-[9px] text-zinc-600 uppercase font-bold mt-0.5">{r.duration} Days</p>
                     </td>
                     <td className="px-8 py-6 text-right">
                        <Link 
                          to={`/admin/rentals/${r.id}`}
                          className="bg-white/5 border border-white/10 text-white px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                        >
                          Manage
                        </Link>
                     </td>
                   </tr>
                 )) : (
                   <tr>
                     <td colSpan={4} className="p-20 text-center text-zinc-600 uppercase text-[10px] italic">No experiences logged in the registry.</td>
                   </tr>
                 )}
               </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalManagement;
