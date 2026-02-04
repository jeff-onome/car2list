
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCars } from '../../context/CarContext';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { dbService } from '../../services/database';
import Swal from 'https://esm.sh/sweetalert2@11';
import { Car } from '../../types';

const DealerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { cars } = useCars();
  const { formatPrice } = useSiteConfig();
  const navigate = useNavigate();
  
  const [activeBookings, setActiveBookings] = useState<any[]>([]);
  const dealerCars = cars.filter(c => c.dealerId === user?.id);
  const totalValuation = dealerCars.reduce((acc, c) => acc + c.price, 0);

  useEffect(() => {
    if (user?.id) {
      const unsubscribe = dbService.subscribeToDealerBookings(user.id, setActiveBookings);
      return () => unsubscribe();
    }
  }, [user]);

  const handleArchive = async (car: Car) => {
    const confirm = await Swal.fire({
      title: 'Archive Listing?',
      text: `The ${car.make} ${car.model} will be removed from the public showroom and inventory.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'YES, ARCHIVE',
      confirmButtonColor: '#71717a',
      background: '#0a0a0a',
      color: '#fff'
    });

    if (confirm.isConfirmed) {
      try {
        await dbService.updateCar(car.id, { status: 'archived', archivedBy: 'DEALER' });
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Asset Archived', showConfirmButton: false, timer: 2000, background: '#111', color: '#fff' });
      } catch (error) {
        Swal.fire('Error', 'Synchronization failed.', 'error');
      }
    }
  };

  const handleRestore = async (car: Car) => {
    try {
      await dbService.updateCar(car.id, { status: 'approved', archivedBy: null as any });
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Listing Restored', showConfirmButton: false, timer: 2000, background: '#111', color: '#fff' });
    } catch (error) {
      Swal.fire('Error', 'Synchronization failed.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-4 md:px-12">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        
        {/* Verification Alert Banner */}
        {!user?.isVerified && (
          <div className="glass bg-red-500/10 border border-red-500/20 rounded-2xl md:rounded-[2rem] p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-8 animate-in fade-in slide-in-from-top-4 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 shrink-0 border border-red-500/10">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold uppercase tracking-widest text-white">Dealer Verification Required</h3>
                <p className="text-[11px] text-zinc-500 uppercase tracking-widest leading-relaxed max-w-lg">Inventory enrollment is currently restricted. Please submit your business credentials for registry approval to begin publishing listings.</p>
              </div>
            </div>
            <Link to="/dealer/verify" className="w-full lg:w-auto bg-white text-black px-10 py-4 rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-xl text-center">
              Enroll Credentials
            </Link>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter">Dealer Hub</h1>
            <p className="text-zinc-500 mt-2 uppercase text-[10px] tracking-[0.2em] font-bold">Managing {user?.name} Portfolio</p>
          </div>
          <button 
            onClick={() => navigate('/dealer/add-car')}
            className={`w-full md:w-auto px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all shadow-xl ${user?.isVerified ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-zinc-500 border border-white/5 cursor-not-allowed hover:bg-zinc-800'}`}
          >
            {user?.isVerified ? 'Enroll New Vehicle' : 'Enrollment Locked'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          <StatCard label="Portfolio Valuation" value={formatPrice(totalValuation)} />
          <StatCard label="Active Listings" value={dealerCars.filter(c => c.status === 'approved').length.toString()} />
          <StatCard label="Review Queue" value={dealerCars.filter(c => c.status === 'pending').length.toString()} />
          <StatCard label="Pending Experiences" value={activeBookings.length.toString()} highlight={activeBookings.length > 0} />
        </div>

        {/* Active Reservations Log */}
        <div className="glass rounded-2xl md:rounded-[3rem] overflow-hidden border-white/5 shadow-2xl">
          <div className="p-6 md:p-8 border-b border-white/5 bg-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
             <h3 className="font-bold uppercase tracking-widest text-[10px] text-zinc-500 flex items-center gap-2">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
               Experience Reservations
             </h3>
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left min-w-[1000px]">
               <thead>
                 <tr className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-white/5 bg-black/20">
                   <th className="px-6 py-5">Vehicle</th>
                   <th className="px-6 py-5">Type</th>
                   <th className="px-6 py-5">Client Identity</th>
                   <th className="px-6 py-5">Schedule</th>
                   <th className="px-6 py-5">Details</th>
                   <th className="px-6 py-5 text-right">Security</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {activeBookings.length > 0 ? activeBookings.map(b => (
                   <tr key={b.id} className="text-sm hover:bg-white/[0.02] transition-colors group">
                     <td className="px-6 py-5">
                       <p className="font-bold text-white uppercase tracking-tight">{b.car}</p>
                       <p className="text-[8px] text-zinc-600 uppercase font-mono">{b.id}</p>
                     </td>
                     <td className="px-6 py-5">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${b.bookingType === 'Test Drive' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                           {b.bookingType || 'Rental'}
                        </span>
                     </td>
                     <td className="px-6 py-5">
                       <p className="font-bold text-zinc-300">{b.userName}</p>
                       <p className="text-[10px] text-zinc-500 lowercase">{b.email}</p>
                     </td>
                     <td className="px-6 py-5">
                        <p className="text-white font-mono">{new Date(b.date).toLocaleDateString()}</p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{b.time}</p>
                     </td>
                     <td className="px-6 py-5">
                        <div className="space-y-1">
                          <p className="text-[10px] text-zinc-300 flex items-center gap-2">
                             <svg className="w-3 h-3 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                             {b.location}
                          </p>
                          <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Duration: {b.duration} {b.bookingType === 'Test Drive' ? 'Hrs' : 'Days'} • Qty: {b.quantity}</p>
                        </div>
                     </td>
                     <td className="px-6 py-5 text-right">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border ${b.securityOption === 'Yes' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-zinc-800 text-zinc-500 border-white/5'}`}>
                           {b.securityOption === 'Yes' ? 'Tier 1 Escort' : 'Standard'}
                        </span>
                     </td>
                   </tr>
                 )) : (
                   <tr>
                     <td colSpan={6} className="p-20 text-center text-zinc-600 uppercase tracking-widest text-[10px] italic">No active reservations recorded.</td>
                   </tr>
                 )}
               </tbody>
            </table>
          </div>
        </div>

        <div className="glass rounded-2xl md:rounded-[3rem] overflow-hidden border-white/5 shadow-2xl">
          <div className="p-6 md:p-8 border-b border-white/5 bg-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="font-bold uppercase tracking-widest text-[10px] text-zinc-500">Live Showroom Status</h3>
            <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono">{dealerCars.length} Assets Registered</span>
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-white/5 bg-black/20">
                  <th className="px-6 md:px-8 py-5">Masterpiece</th>
                  <th className="px-6 md:px-8 py-5 text-center">Status</th>
                  <th className="px-6 md:px-8 py-5 text-center">Valuation</th>
                  <th className="px-6 md:px-8 py-5 text-center">Category</th>
                  <th className="px-6 md:px-8 py-5 text-right">Governance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {dealerCars.length > 0 ? (
                  dealerCars.map(car => (
                    <tr key={car.id} className={`text-sm hover:bg-white/[0.02] transition-colors group ${car.status === 'archived' ? 'opacity-50 grayscale' : ''}`}>
                      <td className="px-6 md:px-8 py-5">
                        <div className="flex items-center gap-4">
                          <img src={car.images[0]} className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover border border-white/10 shadow-lg" alt="" />
                          <div>
                            <p className="font-bold text-white uppercase tracking-tight text-xs md:text-sm">{car.make} {car.model}</p>
                            <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold">{car.year}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 md:px-8 py-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border ${
                          car.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                          car.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                          car.status === 'archived' ? (car.archivedBy === 'ADMIN' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20') :
                          'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                          {car.status === 'archived' && car.archivedBy === 'ADMIN' ? 'Admin Restricted' : (car.status || 'Active')}
                        </span>
                      </td>
                      <td className="px-6 md:px-8 py-5 text-center">
                        <span className="font-mono font-bold text-white tracking-tight">{formatPrice(car.price)}</span>
                      </td>
                      <td className="px-6 md:px-8 py-5 text-center">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-400">
                          {car.type}
                        </span>
                      </td>
                      <td className="px-6 md:px-8 py-5 text-right">
                        <div className="flex gap-4 justify-end">
                          {car.status === 'archived' ? (
                            car.archivedBy === 'DEALER' ? (
                              <button 
                                onClick={() => handleRestore(car)}
                                className="text-[10px] uppercase font-bold text-emerald-500 hover:text-emerald-400 transition-colors underline decoration-white/0 hover:decoration-white/20"
                              >
                                Restore
                              </button>
                            ) : (
                              <span className="text-[9px] uppercase font-bold text-zinc-600 italic">Locked by Admin</span>
                            )
                          ) : (
                            <>
                              <button className="text-[10px] uppercase font-bold text-zinc-500 hover:text-white transition-colors underline decoration-white/0 hover:decoration-white/20">Edit</button>
                              <button 
                                onClick={() => handleArchive(car)}
                                className="text-[10px] uppercase font-bold text-zinc-600 hover:text-white transition-colors"
                              >
                                Archive
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-24 text-center">
                      <svg className="w-12 h-12 text-zinc-800 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                      <p className="text-zinc-600 uppercase tracking-widest text-[10px] italic">No inventory identified for this profile.</p>
                      {user?.isVerified && (
                        <button onClick={() => navigate('/dealer/add-car')} className="mt-4 bg-white/5 border border-white/10 px-8 py-3 rounded-full text-[10px] uppercase tracking-widest text-white hover:bg-white/10 transition-all font-bold">Enroll First Vehicle</button>
                      )}
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

const StatCard: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className={`glass p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border shadow-xl ${highlight ? 'border-amber-500/20 bg-amber-500/[0.02]' : 'border-white/5'}`}>
    <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-2 font-bold">{label}</p>
    <p className={`text-2xl md:text-3xl font-bold tracking-tighter ${highlight ? 'text-amber-500' : 'text-white'}`}>{value}</p>
  </div>
);

export default DealerDashboard;
