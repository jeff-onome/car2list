
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCars } from '../../context/CarContext';

const DealerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { cars } = useCars();
  const navigate = useNavigate();
  
  const dealerCars = cars.filter(c => c.dealerId === user?.id);

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Verification Alert Banner */}
        {!user?.isVerified && (
          <div className="glass bg-red-500/10 border border-red-500/20 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-white">Status: Unverified Dealer</h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Submissions are currently restricted to private draft mode. Admin verification required.</p>
              </div>
            </div>
            <Link to="/dealer/verify" className="bg-white text-black px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-xl whitespace-nowrap">
              Submit KYC Documents
            </Link>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold uppercase tracking-tighter">Dealer Hub</h1>
            <p className="text-zinc-500 mt-2 uppercase text-[10px] tracking-[0.2em] font-bold">Managing {user?.name} Portfolio</p>
          </div>
          <button 
            onClick={() => navigate('/dealer/add-car')}
            className="bg-white text-black px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-xl"
          >
            Enroll New Vehicle
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard label="Portfolio Valuation" value={`$${(dealerCars.reduce((acc, c) => acc + c.price, 0) / 1000000).toFixed(1)}M`} />
          <StatCard label="Active Listings" value={dealerCars.length.toString()} />
          <StatCard label="Review Queue" value={dealerCars.filter(c => c.status === 'pending').length.toString()} />
        </div>

        <div className="glass rounded-3xl overflow-hidden border-white/5 shadow-2xl">
          <div className="p-8 border-b border-white/5 bg-white/5 flex justify-between items-center">
            <h3 className="font-bold uppercase tracking-widest text-[10px] text-zinc-500">Live Showroom Status</h3>
            <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono">{dealerCars.length} Assets Registered</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-white/5 bg-black/20">
                  <th className="px-8 py-5">Masterpiece</th>
                  <th className="px-8 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-center">Valuation</th>
                  <th className="px-8 py-5 text-center">Category</th>
                  <th className="px-8 py-5 text-right">Governance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {dealerCars.length > 0 ? (
                  dealerCars.map(car => (
                    <tr key={car.id} className="text-sm hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <img src={car.images[0]} className="w-12 h-12 rounded-xl object-cover border border-white/10 shadow-lg" alt="" />
                          <div>
                            <p className="font-bold text-white uppercase tracking-tight">{car.make} {car.model}</p>
                            <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold">{car.year} • {car.listingType}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border ${car.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : car.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                          {car.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="font-mono font-bold text-white">${car.price.toLocaleString()}</span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-400">
                          {car.type}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex gap-4 justify-end">
                          <button className="text-[10px] uppercase font-bold text-zinc-500 hover:text-white transition-colors underline decoration-white/0 hover:decoration-white/20">Edit</button>
                          <button className="text-[10px] uppercase font-bold text-red-500/40 hover:text-red-500 transition-colors">Archive</button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-24 text-center">
                      <svg className="w-12 h-12 text-zinc-800 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                      <p className="text-zinc-600 uppercase tracking-widest text-[10px] italic">No inventory identified for this profile.</p>
                      <button onClick={() => navigate('/dealer/add-car')} className="mt-4 bg-white/5 border border-white/10 px-8 py-3 rounded-full text-[10px] uppercase tracking-widest text-white hover:bg-white/10 transition-all font-bold">Enroll First Vehicle</button>
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
  <div className="glass p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
    <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-2 font-bold">{label}</p>
    <p className="text-3xl font-bold tracking-tighter text-white">{value}</p>
  </div>
);

export default DealerDashboard;
