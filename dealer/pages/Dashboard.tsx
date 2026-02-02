
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCars } from '../../context/CarContext';

const DealerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { cars } = useCars();
  const navigate = useNavigate();
  
  // In a real app, we'd use user.id to match dealerId.
  // For mock purposes, let's assume 'dealer1' for 'Luxury Motors' and fallback.
  const targetDealerId = user?.role === 'DEALER' ? 'dealer1' : '';
  const dealerCars = cars.filter(c => c.dealerId === targetDealerId || c.dealerName === user?.name);

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold uppercase tracking-tighter">Dealer Hub</h1>
            <p className="text-zinc-500 mt-2">Managing the {user?.name} collection.</p>
          </div>
          <button 
            onClick={() => navigate('/dealer/add-car')}
            className="bg-white text-black px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-xl"
          >
            Create Listing
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <StatCard label="Inventory Value" value={`$${(dealerCars.reduce((acc, c) => acc + c.price, 0) / 1000000).toFixed(1)}M`} />
          <StatCard label="Live Listings" value={dealerCars.length.toString()} />
          <StatCard label="Client Interest" value="12" />
        </div>

        <div className="glass rounded-3xl overflow-hidden border-white/5 shadow-2xl">
          <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
            <h3 className="font-bold uppercase tracking-widest text-[10px] text-zinc-400">Inventory Status</h3>
            <span className="text-[10px] text-zinc-600 uppercase tracking-widest">{dealerCars.length} Masterpieces</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-white/5">
                  <th className="px-6 py-5">Vehicle</th>
                  <th className="px-6 py-5 text-center">Year</th>
                  <th className="px-6 py-5 text-center">Valuation</th>
                  <th className="px-6 py-5 text-center">Category</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {dealerCars.length > 0 ? (
                  dealerCars.map(car => (
                    <tr key={car.id} className="text-sm hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img src={car.images[0]} className="w-10 h-10 rounded-lg object-cover border border-white/10" alt="" />
                          <div>
                            <p className="font-bold text-white uppercase tracking-tight">{car.make} {car.model}</p>
                            <p className="text-[10px] text-zinc-500">{car.listingType === 'Rent' ? 'Rental Fleet' : 'Sale Inventory'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-mono text-zinc-400">{car.year}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-mono font-bold text-white">${car.price.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-[9px] font-bold tracking-widest uppercase border border-white/10">
                          {car.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-4 justify-end">
                          <button className="text-[10px] uppercase font-bold text-zinc-500 hover:text-white transition-colors">Modify</button>
                          <button className="text-[10px] uppercase font-bold text-red-500/50 hover:text-red-500 transition-colors">Archive</button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <p className="text-zinc-600 uppercase tracking-widest text-[10px] italic">No inventory identified for this profile.</p>
                      <button onClick={() => navigate('/dealer/add-car')} className="mt-4 text-white underline text-[10px] uppercase tracking-widest">Enroll your first vehicle</button>
                    </td>
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

const StatCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="glass p-8 rounded-3xl border border-white/5">
    <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-2 font-bold">{label}</p>
    <p className="text-3xl font-bold tracking-tighter">{value}</p>
  </div>
);

export default DealerDashboard;
