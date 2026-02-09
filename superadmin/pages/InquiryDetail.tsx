
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dbService } from '../../services/database';
import { ContactMessage } from '../../types';
import LoadingScreen from '../../components/LoadingScreen';
import Swal from 'https://esm.sh/sweetalert2@11';

const InquiryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState<ContactMessage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const unsub = dbService.subscribeToContactMessages((data) => {
        const found = data.find(m => m.id === id);
        if (found) setInquiry(found);
        setLoading(false);
      });
      return () => unsub();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!inquiry) return;

    const confirm = await Swal.fire({
      title: 'PERMANENT REMOVAL',
      text: 'This inquiry record will be permanently purged from the registry. This action is irreversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'DELETE PERMANENTLY',
      confirmButtonColor: '#ef4444',
      background: '#0a0a0a',
      color: '#fff',
      customClass: {
        popup: 'glass rounded-[2rem] border border-white/10 shadow-2xl',
        confirmButton: 'px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest'
      }
    });

    if (confirm.isConfirmed) {
      try {
        await dbService.deleteContactMessage(inquiry.id);
        Swal.fire({
          title: 'Purged',
          text: 'The inquiry record has been successfully removed.',
          icon: 'success',
          background: '#0a0a0a',
          color: '#fff'
        }).then(() => navigate('/admin/inquiry'));
      } catch (err) {
        Swal.fire('Error', 'Deletion protocol failed.', 'error');
      }
    }
  };

  if (loading) return <LoadingScreen />;
  if (!inquiry) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold uppercase tracking-widest text-zinc-500">Registry Entry Not Found</h1>
        <button onClick={() => navigate('/admin/inquiry')} className="mt-4 text-white underline font-bold uppercase text-[10px] tracking-widest">Return to List</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="flex items-center gap-6">
           <button 
            onClick={() => navigate('/admin/inquiry')}
            className="p-3 rounded-full glass border-white/5 hover:bg-white/10 transition-all text-zinc-400 hover:text-white"
           >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
           </button>
           <div>
              <h1 className="text-3xl font-bold uppercase tracking-tighter">Inquiry Specification</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1">Registry Ref: <span className="text-white font-mono">{inquiry.id}</span></p>
           </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="glass p-10 rounded-[3rem] border-white/5 space-y-8">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-500 border-b border-white/5 pb-4">Client Identity Profile</h3>
              <div className="space-y-6">
                 <DetailItem label="Full Legal Name" val={inquiry.name} />
                 <DetailItem label="Digital Access Endpoint" val={inquiry.email} mono />
                 <DetailItem label="Asset of Interest" val={inquiry.interest || 'General Portfolio Inquiry'} highlight />
              </div>
           </div>

           <div className="glass p-10 rounded-[3rem] border-white/5 flex flex-col justify-between">
              <div className="space-y-8">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-500 border-b border-white/5 pb-4">Transmission Pulse</h3>
                <div className="space-y-6">
                   <DetailItem label="Received On" val={new Date(inquiry.timestamp).toLocaleString()} mono />
                   <DetailItem label="Channel Integrity" val="End-to-End Encrypted Concierge Tunnel" />
                </div>
              </div>
              
              <div className="pt-8 mt-8 border-t border-white/5">
                 <button 
                  onClick={handleDelete}
                  className="w-full bg-red-500/10 border border-red-500/20 text-red-500 py-4 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-xl"
                 >
                   Purge Entry Permanently
                 </button>
              </div>
           </div>
        </div>

        <div className="glass p-10 md:p-12 rounded-[3.5rem] border-white/5 space-y-8 bg-zinc-950/50">
           <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-500 border-b border-white/5 pb-6">Message Payload</h3>
           <div className="p-8 bg-black/40 rounded-3xl border border-white/5">
              <p className="text-sm text-zinc-300 leading-relaxed italic whitespace-pre-line">
                 "{inquiry.message}"
              </p>
           </div>
        </div>

        <div className="text-center pt-8">
           <p className="text-[9px] text-zinc-700 uppercase tracking-widest leading-relaxed">
             Authorized personnel only. All interactions with this record are logged in the administrative audit trail.
           </p>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, val, mono = false, highlight = false }: any) => (
  <div className="space-y-1.5">
    <p className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold">{label}</p>
    <p className={`${mono ? 'font-mono' : ''} ${highlight ? 'text-lg font-bold text-white tracking-tight' : 'text-sm font-medium text-zinc-200'} truncate`}>
      {val}
    </p>
  </div>
);

export default InquiryDetail;
