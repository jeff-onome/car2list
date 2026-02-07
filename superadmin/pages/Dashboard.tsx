
import React, { useState, useEffect } from 'react';
import { useCars } from '../../context/CarContext';
import { dbService } from '../../services/database';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { User, Rental, Car } from '../../types';
import { Link } from 'react-router-dom';
import LoadingScreen from '../../components/LoadingScreen';

const AdminDashboard: React.FC = () => {
  const { cars, isLoading: carsLoading, getCarById } = useCars();
  const { formatPrice, config, isLoading: configLoading } = useSiteConfig();
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const unsubUsers = dbService.subscribeToUsers(setUsers);
    const unsubBookings = dbService.subscribeToAllBookings(setBookings);
    const unsubRentals = dbService.subscribeToAllRentals((data) => {
       setRentals(data);
       setDataLoading(false);
    });
    return () => {
      unsubUsers();
      unsubBookings();
      unsubRentals();
    };
  }, []);

  const toggleVisibility = async (e: React.MouseEvent, activity: any) => {
    e.stopPropagation();
    const nextState = !activity.hideFromDealer;
    if (activity.type === 'Rental') {
      await dbService.updateRentalVisibility(activity.id, nextState);
    } else {
      await dbService.updateBookingVisibility(activity.id, nextState);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (carsLoading || configLoading || dataLoading) return <LoadingScreen />;

  const pendingCount = cars.filter(c => c.status === 'pending').length;
  const totalVolume = cars.reduce((acc, c) => acc + c.price, 0);
  
  const combinedActivities = [
    ...bookings.map(b => ({ ...b, type: 'Test Drive', date: b.date, label: b.car })),
    ...rentals.map(r => ({ ...r, type: 'Rental', date: r.startDate, label: r.carName, bookingType: 'Rental' }))
  ].sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
          <h1 className="text-4xl font-bold uppercase tracking-tighter">Master Control</h1>
          <Link to="/admin/add-car" className="w-full sm:w-auto text-center bg-white text-black px-10 py-3.5 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-zinc-200 transition-all shadow-xl">Enroll Vehicle</Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-12">
          <Stat label="Global Users" value={users.length.toLocaleString()} />
          <Stat label={`Total Volume (${config.activeCurrency})`} value={formatPrice(totalVolume)} />
          <Stat label="Pending Moderation" value={pendingCount.toString()} highlight={pendingCount > 0} />
          <Stat label="Total Requests" value={combinedActivities.length.toString()} highlight={combinedActivities.length > 0} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
           <div className="lg:col-span-2 glass p-6 md:p-8 rounded-[3rem] border-white/5 flex flex-col min-h-[500px]">
              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                 <h3 className="text-sm font-bold uppercase tracking-widest text-white">Experience Registry</h3>
                 <span className="text-[10px] text-zinc-600 font-mono hidden sm:block">Real-time Global Pulse</span>
              </div>
              <div className="flex-grow overflow-y-auto no-scrollbar space-y-4">
                 {combinedActivities.length > 0 ? combinedActivities.map((activity, idx) => {
                   const isExpanded = expandedId === activity.id;
                   const carData = getCarById(activity.carId);
                   const userData = users.find(u => u.id === activity.userId);

                   return (
                     <div 
                       key={activity.id || idx} 
                       onClick={() => toggleExpand(activity.id)}
                       className={`glass bg-white/[0.02] p-6 rounded-[1.5rem] border-white/5 flex flex-col transition-all duration-500 cursor-pointer active:scale-[0.99] ${isExpanded ? 'bg-white/[0.05] border-white/20' : 'hover:bg-white/[0.04]'}`}
                     >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                          <div className="flex gap-4 sm:gap-6 items-center w-full sm:w-auto">
                             <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500 shrink-0">
                                {activity.type === 'Rental' ? (
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                ) : (
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                )}
                             </div>
                             <div className="overflow-hidden">
                                <div className="flex items-center gap-2">
                                   <p className="text-sm font-bold text-white uppercase tracking-tight truncate">{activity.label}</p>
                                   <span className={`px-1.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-widest border shrink-0 ${activity.type === 'Test Drive' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                      {activity.type}
                                   </span>
                                </div>
                                <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mt-1 truncate">{activity.userName}</p>
                             </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
                             <div className="text-left sm:text-right">
                               <p className="text-[10px] text-zinc-400 font-mono">{activity.date ? new Date(activity.date).toLocaleDateString() : 'N/A'}</p>
                               <p className={`text-[8px] font-bold uppercase tracking-widest mt-1 ${activity.status === 'Accepted' || activity.status === 'Confirmed' ? 'text-green-500' : 'text-zinc-600'}`}>
                                  {activity.status || 'Pending'}
                               </p>
                             </div>
                             
                             <div className="flex flex-col items-center gap-1 sm:pl-4 sm:border-l border-white/5">
                                <span className="text-[7px] uppercase font-bold text-zinc-600 tracking-tighter">Sync</span>
                                <button 
                                  onClick={(e) => toggleVisibility(e, activity)}
                                  className={`p-2 rounded-full transition-all ${activity.hideFromDealer ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20' : 'text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20'}`}
                                >
                                   {activity.hideFromDealer ? (
                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                                   ) : (
                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                   )}
                                </button>
                             </div>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
                             <div className="space-y-4">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Member Telemetry</p>
                                <div className="space-y-2">
                                   <p className="text-xs text-white font-bold">{activity.userName}</p>
                                   <p className="text-[10px] text-zinc-500 lowercase font-mono truncate">{activity.userEmail || userData?.email || 'email@hidden.com'}</p>
                                   <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">Role: {userData?.role || 'Guest'}</p>
                                </div>
                             </div>
                             <div className="space-y-4">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Experience Logistics</p>
                                <div className="space-y-2">
                                   <div className="flex justify-between items-center text-[10px]">
                                      <span className="text-zinc-600 uppercase font-bold">Schedule</span>
                                      <span className="text-white font-mono">{activity.date} {activity.time && `@ ${activity.time}`}</span>
                                   </div>
                                   {activity.type === 'Rental' && (
                                      <>
                                         <div className="flex justify-between items-center text-[10px]">
                                            <span className="text-zinc-600 uppercase font-bold">Duration</span>
                                            <span className="text-white">{activity.duration} Days</span>
                                         </div>
                                         <div className="flex justify-between items-center text-[10px]">
                                            <span className="text-zinc-600 uppercase font-bold">Location</span>
                                            <span className="text-white truncate max-w-[120px]">{activity.location || 'HQ'}</span>
                                         </div>
                                      </>
                                   )}
                                   <div className="flex justify-between items-center text-[10px]">
                                      <span className="text-zinc-600 uppercase font-bold">Total Val.</span>
                                      <span className="text-white font-bold">{activity.totalPrice ? formatPrice(activity.totalPrice) : 'Inquiry'}</span>
                                   </div>
                                </div>
                             </div>
                             <div className="space-y-4">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Asset Specifications</p>
                                {carData ? (
                                  <div className="space-y-2">
                                     <p className="text-xs text-white font-bold uppercase">{carData.make} {carData.model}</p>
                                     <div className="flex flex-wrap gap-2">
                                        <span className="text-[8px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-zinc-400 font-bold">{carData.type}</span>
                                        <span className="text-[8px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-zinc-400 font-bold">{carData.hp} HP</span>
                                     </div>
                                     <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest mt-1">Ref: {carData.id.slice(-6)}</p>
                                  </div>
                                ) : (
                                  <p className="text-[10px] text-zinc-700 italic">Asset data unavailable</p>
                                )}
                             </div>
                          </div>
                        )}
                     </div>
                   );
                 }) : (
                   <div className="flex flex-col items-center justify-center h-full opacity-30 italic uppercase tracking-[0.2em] text-[10px] py-20">Registry Empty</div>
                 )}
              </div>
           </div>

           <div className="space-y-6 md:space-y-8">
              <div className="glass p-8 rounded-[2.5rem] border-white/5">
                <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-zinc-400">Moderation Queue</h3>
                <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar">
                  {cars.filter(c => c.status === 'pending').map(c => (
                    <div key={c.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex justify-between items-center">
                      <span className="text-[10px] font-bold text-white truncate mr-2">{c.make} {c.model}</span>
                      <span className="text-[8px] text-zinc-600 shrink-0">{new Date(c.createdAt || '').toLocaleDateString()}</span>
                    </div>
                  ))}
                  {pendingCount === 0 && <p className="text-[9px] text-zinc-700 text-center uppercase py-10">Queue Clear</p>}
                </div>
              </div>
              
              <div className="glass p-8 rounded-[2.5rem] border-white/5">
                <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-zinc-400">Member Logs</h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
                  {users.slice(-10).reverse().map(u => (
                    <div key={u.id} className="flex justify-between items-center text-[10px] border-b border-white/5 pb-2 last:border-0 last:pb-0">
                      <span className="text-zinc-300 font-bold truncate mr-2">{u.name}</span>
                      <span className="text-zinc-600 uppercase text-[8px] shrink-0">{u.role}</span>
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
