
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dbService } from '../../services/database';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { Rental } from '../../types';
import LoadingScreen from '../../components/LoadingScreen';
import Swal from 'https://esm.sh/sweetalert2@11';

const RentalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatPrice } = useSiteConfig();
  const [rental, setRental] = useState<Rental | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const unsub = dbService.subscribeToAllRentals((data) => {
        const found = data.find(r => r.id === id);
        if (found) setRental(found);
        setLoading(false);
      });
      return () => unsub();
    }
  }, [id]);

  const handleAction = async (status: Rental['status']) => {
    if (!rental) return;

    const confirm = await Swal.fire({
      title: `<span style="text-transform: uppercase;">${status} Request?</span>`,
      text: `Are you sure you want to transition this rental to ${status.toLowerCase()}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: status === 'Accepted' ? '#22c55e' : '#ef4444',
      confirmButtonText: `YES, ${status.toUpperCase()}`,
      background: '#0a0a0a',
      color: '#fff',
      customClass: {
        popup: 'glass rounded-[2rem] border border-white/10'
      }
    });

    if (confirm.isConfirmed) {
      await dbService.updateRentalStatus(rental.id, status);
      await dbService.createNotification(rental.userId, {
        title: `Rental ${status}`,
        message: `Your reservation for ${rental.carName} has been ${status.toLowerCase()} by administration.`,
        type: status === 'Accepted' ? 'success' : 'warning'
      });
      Swal.fire({
        title: 'Action Synchronized',
        icon: 'success',
        background: '#0a0a0a',
        color: '#fff'
      });
    }
  };

  if (loading) return <LoadingScreen />;
  if (!rental) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold uppercase tracking-widest text-zinc-500">Record not found</h1>
        <button onClick={() => navigate('/admin/rentals')} className="mt-4 text-white underline font-bold uppercase text-[10px] tracking-widest">Return to Registry</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="flex items-center gap-6">
           <button 
            onClick={() => navigate('/admin/rentals')}
            className="p-3 rounded-full glass border-white/5 hover:bg-white/10 transition-all text-zinc-400 hover:text-white"
           >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
           </button>
           <div>
              <h1 className="text-3xl font-bold uppercase tracking-tighter">Experience Specification</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1">Registry Ref: <span className="text-white font-mono">{rental.id}</span></p>
           </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Section 1: Client Information */}
           <div className="glass p-10 rounded-[3rem] border-white/5 space-y-8">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                 <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-500">Client Protocol</h3>
                 <span className="text-[8px] bg-white/5 border border-white/10 px-3 py-1 rounded-full text-zinc-400 font-bold uppercase tracking-widest">Verified Member</span>
              </div>
              <div className="space-y-6">
                 <DetailItem label="Identity Profile" val={rental.userName} />
                 <DetailItem label="Access Endpoint" val={rental.userEmail} />
                 <DetailItem label="Internal UID" val={rental.userId} mono />
              </div>
           </div>

           {/* Section 2: Asset Information */}
           <div className="glass p-10 rounded-[3rem] border-white/5 space-y-8">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                 <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-500">Asset Specification</h3>
                 <span className="text-[8px] bg-white/5 border border-white/10 px-3 py-1 rounded-full text-zinc-400 font-bold uppercase tracking-widest">High-Value Inventory</span>
              </div>
              <div className="space-y-6">
                 <DetailItem label="Vehicle Unit" val={rental.carName} />
                 <DetailItem label="Authorized Dealer" val={rental.dealerName} />
                 <DetailItem label="Asset Registry ID" val={rental.carId} mono />
              </div>
           </div>
        </div>

        {/* Section 3: Logistics & Financials */}
        <div className="glass p-10 md:p-12 rounded-[3.5rem] border-white/5 space-y-12">
           <div className="flex justify-between items-center border-b border-white/5 pb-6">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-500">Logistics & Liquidity</h3>
              <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${rental.status === 'Accepted' ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`} />
                 <span className="text-[9px] uppercase font-bold tracking-widest">{rental.status} Phase</span>
              </div>
           </div>

           <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
              <DetailItem label="Activation Date" val={new Date(rental.startDate).toLocaleDateString()} mono />
              <DetailItem label="Lease Duration" val={`${rental.duration} Days`} />
              <DetailItem label="Delivery Hub" val={rental.location || 'Private Port'} />
              <DetailItem label="Total Valuation" val={formatPrice(rental.totalPrice)} highlight />
           </div>

           <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="space-y-1 text-center md:text-left">
                 <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">Submission Timestamp</p>
                 <p className="text-xs text-zinc-400 font-mono">{new Date(rental.createdAt).toLocaleString()}</p>
              </div>
              
              {rental.status === 'Pending' && (
                <div className="flex gap-4 w-full md:w-auto">
                   <button 
                    onClick={() => handleAction('Accepted')}
                    className="flex-grow md:flex-grow-0 bg-white text-black px-12 py-4 rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                   >
                     Approve Lease
                   </button>
                   <button 
                    onClick={() => handleAction('Cancelled')}
                    className="flex-grow md:flex-grow-0 bg-red-500/10 border border-red-500/20 text-red-500 px-8 py-4 rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                   >
                     Decline
                   </button>
                </div>
              )}

              {(rental.status === 'Accepted' || rental.status === 'Cancelled') && (
                <div className="flex items-center gap-4">
                   <p className="text-[10px] text-zinc-600 uppercase tracking-widest italic">Governance action finalized</p>
                   <button 
                    onClick={() => handleAction('Pending')}
                    className="text-[9px] text-zinc-400 hover:text-white underline uppercase tracking-widest transition-colors font-bold"
                   >
                     Revert to Pending
                   </button>
                </div>
              )}
           </div>
        </div>

        <div className="text-center pt-8">
           <p className="text-[9px] text-zinc-700 uppercase tracking-widest leading-relaxed">
             This record is cryptographically signed and stored in the AutoSphere global distributed ledger. <br/>
             Authorized administrative access only.
           </p>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, val, mono = false, highlight = false }: any) => (
  <div className="space-y-1.5">
    <p className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold">{label}</p>
    <p className={`${mono ? 'font-mono' : ''} ${highlight ? 'text-2xl font-bold text-white tracking-tighter' : 'text-sm font-medium text-zinc-200'} truncate`}>
      {val}
    </p>
  </div>
);

export default RentalDetail;
