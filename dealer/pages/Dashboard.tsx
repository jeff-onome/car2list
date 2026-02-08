
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCars } from '../../context/CarContext';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { dbService } from '../../services/database';
import { Rental } from '../../types';
import LoadingScreen from '../../components/LoadingScreen';

const DealerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { cars, isLoading: carsLoading, getCarById } = useCars();
  const { formatPrice, isLoading: configLoading } = useSiteConfig();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const dealerCars = cars.filter(c => c.dealerId === user?.id);
  const totalValuation = dealerCars.reduce((acc, c) => acc + c.price, 0);

  useEffect(() => {
    if (user?.id) {
      const unsubRentals = dbService.subscribeToDealerRentals(user.id, (data) => {
        setRentals(data);
      });
      const unsubBookings = dbService.subscribeToDealerBookings(user.id, (data) => {
        setBookings(data);
        setDataLoading(false);
      });
      return () => {
        unsubRentals();
        unsubBookings();
      };
    }
  }, [user]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (carsLoading || configLoading || dataLoading) return <LoadingScreen />;

  const activeActivities = [
    ...rentals.map(r => ({ ...r, type: 'Rental', displayDate: new Date(r.startDate).toLocaleDateString() + ` (${r.duration}d)`, label: r.carName })),
    ...bookings.map(b => ({ ...b, type: 'Test Drive', displayDate: new Date(b.date).toLocaleDateString() + ` @ ${b.time}`, label: b.car }))
  ].sort((a,b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-4 md:px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold uppercase tracking-tighter">Dealer Hub</h1>
            <p className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest mt-2">Managing Portfolio for <span className="text-white">{user?.name}</span></p>
          </div>
          <Link to="/dealer/add-car" className="w-full sm:w-auto text-center bg-white text-black px-10 py-3.5 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-zinc-200 shadow-xl transition-all">Enroll Vehicle</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard label="Fleet Valuation" val={formatPrice(totalValuation)} />
          <StatCard label="Active Listings" val={dealerCars.filter(c=>c.status==='approved').length.toString()} />
          <StatCard label="Live Activities" val={activeActivities.length.toString()} highlight />
        </div>

        <div className="space-y-8">
          <div className="flex justify-between items-center border-b border-white/5 pb-4 px-2">
            <h3 className="font-bold uppercase tracking-widest text-[10px] text-zinc-500">Experience Fleet Ledger</h3>
            <span className="text-[8px] text-zinc-700 uppercase font-bold tracking-widest hidden sm:block">Tap Entry to Inspect Payload</span>
          </div>

          <div className="space-y-4">
            {activeActivities.length > 0 ? activeActivities.map((r, idx) => {
              const isExpanded = expandedId === r.id;
              const carData = getCarById(r.carId);

              return (
                <div 
                  key={r.id || idx}
                  onClick={() => toggleExpand(r.id)}
                  className={`glass p-5 md:p-6 rounded-[1.5rem] border transition-all duration-500 cursor-pointer active:scale-[0.99] ${isExpanded ? 'bg-white/[0.05] border-white/20' : 'bg-white/[0.01] border-white/5 hover:border-white/10'}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex gap-4 sm:gap-6 items-center w-full sm:w-auto">
                      <span className={`px-2 py-0.5 rounded text-[7px] font-bold uppercase tracking-widest border shrink-0 ${
                        r.type === 'Rental' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      }`}>{r.type}</span>
                      <div className="overflow-hidden flex-grow">
                        <p className="font-bold uppercase text-white text-sm tracking-tight truncate">{r.label}</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-0.5 truncate">{r.userName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-10 w-full sm:w-auto border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
                       <div className="text-left sm:text-right">
                          <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest mb-1">Schedule</p>
                          <p className="text-zinc-400 font-mono text-xs">{r.displayDate}</p>
                       </div>
                       <div className="flex items-center gap-6">
                          <div className="text-right">
                             <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest mb-1">Status</p>
                             <span className={`px-3 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest border ${
                               r.status === 'Accepted' || r.status === 'Confirmed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                             }`}>{r.status}</span>
                          </div>
                          <svg className={`w-4 h-4 text-zinc-700 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                       </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
                       <div className="space-y-4">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Client Protocol</p>
                          <div className="space-y-2">
                             <p className="text-xs text-white font-bold">{r.userName}</p>
                             <p className="text-[10px] text-zinc-500 lowercase font-mono truncate">{r.userEmail || 'Registry Identity Protected'}</p>
                             <div className="pt-1">
                                <span className="text-[7px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-zinc-400 font-bold uppercase tracking-widest">Identity Authentication Confirmed</span>
                             </div>
                          </div>
                       </div>
                       <div className="space-y-4">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Logistic Spec</p>
                          <div className="space-y-2">
                             <div className="flex justify-between items-center text-[10px]">
                                <span className="text-zinc-600 uppercase font-bold">Start Date</span>
                                <span className="text-white font-mono">{new Date(r.startDate || r.date).toLocaleDateString()}</span>
                             </div>
                             {r.type === 'Rental' && (
                                <>
                                   <div className="flex justify-between items-center text-[10px]">
                                      <span className="text-zinc-600 uppercase font-bold">Duration</span>
                                      <span className="text-white">{r.duration} Days</span>
                                   </div>
                                   <div className="flex justify-between items-center text-[10px]">
                                      <span className="text-zinc-600 uppercase font-bold">Delivery Hub</span>
                                      <span className="text-white truncate max-w-[140px]">{r.location || 'Private Hangar'}</span>
                                   </div>
                                </>
                             )}
                             <div className="flex justify-between items-center text-[10px] pt-1 border-t border-white/5 mt-1">
                                <span className="text-zinc-600 uppercase font-bold">Payload Value</span>
                                <span className="text-white font-bold">{r.totalPrice ? formatPrice(r.totalPrice) : 'Inquiry Level Access'}</span>
                             </div>
                          </div>
                       </div>
                       <div className="space-y-4 sm:col-span-2 lg:col-span-1">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Asset Data</p>
                          {carData ? (
                            <div className="space-y-2">
                               <p className="text-xs text-white font-bold uppercase tracking-tight">{carData.make} {carData.model}</p>
                               <div className="flex flex-wrap gap-2">
                                  <span className="text-[8px] bg-zinc-900 border border-white/5 px-2 py-0.5 rounded text-zinc-400 font-bold uppercase">{carData.year} Edition</span>
                                  <span className="text-[8px] bg-zinc-900 border border-white/5 px-2 py-0.5 rounded text-zinc-400 font-bold uppercase">{carData.transmission}</span>
                               </div>
                               <div className="pt-2 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                  <span className="text-[8px] text-zinc-500 uppercase font-bold tracking-widest">Active In Showroom Ledger</span>
                               </div>
                            </div>
                          ) : (
                            <p className="text-[10px] text-zinc-700 italic">Inventory Record Severed</p>
                          )}
                       </div>
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="p-32 glass rounded-[3rem] text-center border-white/5">
                <p className="text-zinc-600 uppercase text-[10px] tracking-[0.3em] italic">No experiences logged in the registry.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, val, highlight }: any) => (
  <div className={`glass p-6 md:p-8 rounded-[1.5rem] border transition-all ${highlight ? 'border-amber-500/20 bg-amber-500/[0.03]' : 'border-white/5 hover:border-white/10'}`}>
    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-3 font-bold">{label}</p>
    <p className={`text-2xl md:text-3xl font-bold tracking-tighter ${highlight ? 'text-amber-500' : 'text-white'}`}>{val}</p>
  </div>
);

export default DealerDashboard;
