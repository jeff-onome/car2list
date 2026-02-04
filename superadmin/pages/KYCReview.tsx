
import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/database';
import { User } from '../../types';
import Swal from 'https://esm.sh/sweetalert2@11';

const KYCReview: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    const unsubscribe = dbService.subscribeToUsers((data) => {
      // Only show users who have actually submitted documents
      setUsers(data.filter(u => u.kycDocuments));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter(u => u.kycStatus === filter || (!u.kycStatus && filter === 'pending'));

  const handleApprove = async (user: User) => {
    const confirm = await Swal.fire({
      title: 'Approve Identity?',
      text: `Grant full system access to ${user.name}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'APPROVE',
      confirmButtonColor: '#22c55e',
      background: '#0a0a0a',
      color: '#fff'
    });

    if (confirm.isConfirmed) {
      try {
        await dbService.updateUser(user.id, { 
          kycStatus: 'approved', 
          isVerified: true 
        });
        
        await dbService.createNotification(user.id, {
          title: 'Identity Verified',
          message: 'Congratulations! Your identity has been successfully validated. You now have full access to our elite services.',
          type: 'success'
        });

        Swal.fire('Identity Confirmed', `${user.name} is now a verified member.`, 'success');
      } catch (e) {
        Swal.fire('Error', 'Verification update failed.', 'error');
      }
    }
  };

  const handleDecline = async (user: User) => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: 'Decline Submission?',
      text: 'Provide a reason for declining these documents.',
      input: 'textarea',
      inputPlaceholder: 'e.g. Images too blurry, expired ID...',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'DECLINE',
      confirmButtonColor: '#ef4444',
      background: '#0a0a0a',
      color: '#fff',
      customClass: {
        input: 'bg-zinc-900 text-white border-white/10 rounded-2xl'
      }
    });

    if (isConfirmed) {
      try {
        await dbService.updateUser(user.id, { 
          kycStatus: 'rejected',
          isVerified: false
        });
        
        await dbService.createNotification(user.id, {
          title: 'KYC Action Required',
          message: `Your identity verification was declined: ${reason || 'Incomplete documentation'}. Please resubmit valid assets.`,
          type: 'warning'
        });

        Swal.fire('Decline Sent', 'The user has been notified of the rejection.', 'info');
      } catch (e) {
        Swal.fire('Error', 'Action failed.', 'error');
      }
    }
  };

  const openDocument = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter text-white">KYC Review Center</h1>
          <p className="text-zinc-500 mt-2 text-sm uppercase tracking-widest font-bold">Document Authentication & Identity Clearance</p>
        </header>

        {/* Filters */}
        <div className="flex gap-2 md:gap-4 mb-10 overflow-x-auto no-scrollbar pb-2">
           {(['pending', 'approved', 'rejected'] as const).map(f => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={`px-8 py-3 rounded-full text-[10px] uppercase font-bold tracking-widest transition-all whitespace-nowrap flex items-center gap-3 ${filter === f ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800'}`}
             >
               {f}
               <span className={`px-2 py-0.5 rounded-full text-[8px] ${filter === f ? 'bg-black text-white' : 'bg-white/10 text-zinc-400'}`}>
                 {users.filter(u => u.kycStatus === f || (!u.kycStatus && f === 'pending')).length}
               </span>
             </button>
           ))}
        </div>

        {loading ? (
          <div className="p-20 text-center text-zinc-600 animate-pulse uppercase tracking-[0.3em] text-[10px]">Retrieving secure documentation...</div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {filteredUsers.length > 0 ? filteredUsers.map(u => (
              <div key={u.id} className="glass rounded-[3rem] border-white/5 overflow-hidden flex flex-col lg:flex-row group hover:border-white/10 transition-all duration-500 shadow-2xl">
                 {/* Identity Info */}
                 <div className="lg:w-1/4 p-8 md:p-12 bg-white/[0.02] border-r border-white/5">
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
                       <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-white/5 flex items-center justify-center text-2xl font-bold uppercase overflow-hidden">
                          {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" alt="" /> : u.name.charAt(0)}
                       </div>
                       <div>
                          <h3 className="text-xl font-bold text-white uppercase tracking-tight">{u.name}</h3>
                          <p className="text-[10px] text-zinc-500 font-mono mt-1">{u.email}</p>
                          <div className="mt-4 flex flex-wrap justify-center lg:justify-start gap-2">
                             <span className="bg-white/5 px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest text-zinc-400 border border-white/5">{u.role}</span>
                             <span className="bg-white/5 px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest text-zinc-400 border border-white/5">ID: {u.id.slice(-6)}</span>
                          </div>
                       </div>
                       <div className="pt-8 w-full space-y-3">
                          {filter === 'pending' && (
                             <>
                                <button onClick={() => handleApprove(u)} className="w-full bg-white text-black py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-green-50 transition-all">Grant Clearance</button>
                                <button onClick={() => handleDecline(u)} className="w-full bg-white/5 border border-white/10 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Decline Submission</button>
                             </>
                          )}
                          {filter !== 'pending' && (
                             <div className={`text-center p-4 rounded-3xl border ${filter === 'approved' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                                <span className="text-[9px] font-bold uppercase tracking-[0.2em]">{filter}</span>
                             </div>
                          )}
                       </div>
                    </div>
                 </div>

                 {/* Document Display */}
                 <div className="flex-grow p-8 md:p-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <DocThumb label="ID FRONT" url={u.kycDocuments?.front || ''} onClick={() => openDocument(u.kycDocuments?.front || '')} />
                       <DocThumb label="ID BACK" url={u.kycDocuments?.back || ''} onClick={() => openDocument(u.kycDocuments?.back || '')} />
                       <DocThumb label="SELFIE" url={u.kycDocuments?.selfie || ''} onClick={() => openDocument(u.kycDocuments?.selfie || '')} />
                    </div>
                    <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-zinc-600 gap-4">
                       <p>Submitted On: <span className="text-zinc-400">{u.kycDocuments?.submittedAt ? new Date(u.kycDocuments.submittedAt).toLocaleString() : 'N/A'}</span></p>
                       <p className="italic opacity-50">Assets encrypted at rest via Supabase Storage</p>
                    </div>
                 </div>
              </div>
            )) : (
              <div className="glass p-32 rounded-[4rem] text-center border-white/5">
                 <svg className="w-16 h-16 text-zinc-800 mx-auto mb-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                 <p className="text-zinc-600 uppercase tracking-[0.3em] text-[10px] italic">No identities found in this registry queue.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const DocThumb = ({ label, url, onClick }: { label: string, url: string, onClick: () => void }) => (
  <div className="space-y-3">
     <div className="flex justify-between items-center px-2">
        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">{label}</span>
        <button onClick={onClick} className="text-[8px] text-white underline opacity-0 group-hover:opacity-60 hover:opacity-100 transition-all uppercase tracking-tighter">Inspect Full Size</button>
     </div>
     <div 
        onClick={onClick}
        className="aspect-video bg-zinc-900 rounded-3xl border border-white/5 overflow-hidden cursor-zoom-in relative group/thumb"
     >
        {url ? (
           <>
              <img src={url} className="w-full h-full object-cover transition-transform duration-700 group-hover/thumb:scale-110" alt={label} />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                 <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
              </div>
           </>
        ) : (
           <div className="w-full h-full flex items-center justify-center">
              <span className="text-[8px] text-zinc-700 uppercase font-bold tracking-widest italic">Asset missing</span>
           </div>
        )}
     </div>
  </div>
);

export default KYCReview;
