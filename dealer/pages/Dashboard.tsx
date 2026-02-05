
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCars } from '../../context/CarContext';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { dbService } from '../../services/database';
import { Rental } from '../../types';

const DealerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { cars } = useCars();
  const { formatPrice } = useSiteConfig();
  const [rentals, setRentals] = useState<Rental[]>([]);
  
  const dealerCars = cars.filter(c => c.dealerId === user?.id);
  const totalValuation = dealerCars.reduce((acc, c) => acc + c.price, 0);

  useEffect(() => {
    if (user?.id) {
      const unsub = dbService.subscribeToDealerRentals(user.id, setRentals);
      return () => unsub();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold uppercase tracking-tighter">Dealer Hub</h1>
            <p className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest mt-2">Managing {user?.name} Portfolio</p>
          </div>
          <Link to="/dealer/add-car" className="bg-white text-black px-10 py-3.5 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-zinc-200">Enroll Vehicle</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Fleet Valuation" val={formatPrice(totalValuation)} />
          <StatCard label="Active Listings" val={dealerCars.filter(c=>c.status==='approved').length.toString()} />
          <StatCard label="Fleet Rentals" val={rentals.length.toString()} highlight />
        </div>

        <div className="glass rounded-[3rem] overflow-hidden border-white/5 shadow-2xl">
          <div className="p-8 border-b border-white/5 bg-white/5 flex justify-between items-center">
            <h3 className="font-bold uppercase tracking-widest text-[10px] text-zinc-500">Live Experience Fleet</h3>
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left">
              <thead className="text-[9px] uppercase tracking-[0.2em] text-zinc-600 bg-black/20 border-b border-white/5">
                <tr>
                  <th className="px-8 py-5">Vehicle</th>
                  <th className="px-8 py-5">Client Identity</th>
                  <th className="px-8 py-5">Schedule</th>
                  <th className="px-8 py-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rentals.map(r => (
                  <tr key={r.id} className="text-sm hover:bg-white/[0.01] transition-colors">
                    <td className="px-8 py-5 font-bold uppercase text-white">{r.carName}</td>
                    <td className="px-8 py-5">
                       <p className="text-zinc-300">{r.userName}</p>
                       <p className="text-[10px] text-zinc-500 lowercase">{r.userEmail}</p>
                    </td>
                    <td className="px-8 py-5 text-zinc-400 font-mono text-xs">{new Date(r.startDate).toLocaleDateString()} ({r.duration}d)</td>
                    <td className="px-8 py-5 text-right">
                       <span className={`px-3 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest border ${
                         r.status === 'Accepted' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                       }`}>{r.status}</span>
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

const StatCard = ({ label, val, highlight }: any) => (
  <div className={`glass p-8 rounded-[2.5rem] border ${highlight ? 'border-amber-500/20 bg-amber-500/5' : 'border-white/5'}`}>
    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-bold">{label}</p>
    <p className={`text-2xl font-bold tracking-tight ${highlight ? 'text-amber-500' : 'text-white'}`}>{val}</p>
  </div>
);

export default DealerDashboard;
