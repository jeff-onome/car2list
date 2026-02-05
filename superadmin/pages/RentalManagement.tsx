
import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/database';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { Rental } from '../../types';
import Swal from 'https://esm.sh/sweetalert2@11';

const RentalManagement: React.FC = () => {
  const { formatPrice } = useSiteConfig();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = dbService.subscribeToAllRentals((data) => {
      setRentals(data.sort((a,b) => b.createdAt.localeCompare(a.createdAt)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAction = async (rid: string, status: Rental['status'], uid: string) => {
    const confirm = await Swal.fire({
      title: `${status} Rental?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: status === 'Accepted' ? '#22c55e' : '#ef4444',
      background: '#0a0a0a', color: '#fff'
    });

    if (confirm.isConfirmed) {
      await dbService.updateRentalStatus(rid, status);
      await dbService.createNotification(uid, {
        title: `Rental ${status}`,
        message: `Your reservation request has been ${status.toLowerCase()} by administration.`,
        type: status === 'Accepted' ? 'success' : 'warning'
      });
      Swal.fire('Updated', `Rental is now ${status}`, 'success');
    }
  };

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
                   <th className="px-8 py-6">Asset & ID</th>
                   <th className="px-8 py-6">Identity</th>
                   <th className="px-8 py-6">Schedule</th>
                   <th className="px-8 py-6">Total</th>
                   <th className="px-8 py-6">Status</th>
                   <th className="px-8 py-6 text-right">Governance</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {rentals.map(r => (
                   <tr key={r.id} className="text-sm hover:bg-white/[0.02] transition-colors">
                     <td className="px-8 py-6">
                        <p className="font-bold uppercase text-white">{r.carName}</p>
                        <p className="text-[9px] font-mono text-zinc-600 mt-1">{r.id}</p>
                     </td>
                     <td className="px-8 py-6">
                        <p className="text-zinc-300 font-bold">{r.userName}</p>
                        <p className="text-[10px] text-zinc-500 lowercase">{r.userEmail}</p>
                     </td>
                     <td className="px-8 py-6">
                        <p className="text-zinc-300 font-mono">{new Date(r.startDate).toLocaleDateString()}</p>
                        <p className="text-[10px] text-zinc-600 uppercase font-bold">{r.duration} Days</p>
                     </td>
                     <td className="px-8 py-6 font-mono font-bold text-white">{formatPrice(r.totalPrice)}</td>
                     <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border ${
                          r.status === 'Accepted' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                          r.status === 'Cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}>{r.status}</span>
                     </td>
                     <td className="px-8 py-6 text-right">
                        {r.status === 'Pending' && (
                          <div className="flex gap-3 justify-end">
                            <button onClick={() => handleAction(r.id, 'Accepted', r.userId)} className="bg-green-500/10 text-green-500 p-2 rounded-full hover:bg-green-500 hover:text-black transition-all">Accept</button>
                            <button onClick={() => handleAction(r.id, 'Cancelled', r.userId)} className="bg-red-500/10 text-red-500 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all">Cancel</button>
                          </div>
                        )}
                     </td>
                   </tr>
                 ))}
               </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalManagement;
