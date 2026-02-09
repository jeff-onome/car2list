
import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/database';
import LoadingScreen from '../../components/LoadingScreen';
import Swal from 'https://esm.sh/sweetalert2@11';

const MessageHistory: React.FC = () => {
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [directMsgs, setDirectMsgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'broadcast' | 'direct'>('broadcast');

  useEffect(() => {
    let bSync = false;
    let dSync = false;

    const checkLoading = () => {
      if (bSync && dSync) {
        setLoading(false);
      }
    };

    const unsubB = dbService.subscribeToBroadcastHistory((data) => {
      setBroadcasts(data);
      bSync = true;
      checkLoading();
    });

    const unsubD = dbService.subscribeToDirectMessageHistory((data) => {
      setDirectMsgs(data);
      dSync = true;
      checkLoading();
    });

    return () => { 
      unsubB(); 
      unsubD(); 
    };
  }, []);

  const handleEdit = async (item: any, type: 'broadcast' | 'direct') => {
    const { value: formValues } = await Swal.fire({
      title: `<span style="text-transform: uppercase; font-size: 1.25rem;">Edit Communication</span>`,
      html: `
        <div style="text-align: left; padding: 1rem; color: #a1a1aa; font-family: Inter, sans-serif;">
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; font-size: 9px; text-transform: uppercase; color: #71717a; margin-bottom: 0.5rem; letter-spacing: 0.1em;">Communication Title</label>
            <input id="swal-title" type="text" class="swal2-input" style="width: 100%; margin: 0; background: #18181b; border: 1px solid #27272a; color: white; border-radius: 1rem;" value="${item.title}">
          </div>
          <div>
            <label style="display: block; font-size: 9px; text-transform: uppercase; color: #71717a; margin-bottom: 0.5rem; letter-spacing: 0.1em;">Message Payload</label>
            <textarea id="swal-message" class="swal2-textarea" style="width: 100%; margin: 0; background: #18181b; border: 1px solid #27272a; color: white; border-radius: 1.5rem; min-height: 120px;">${item.message}</textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'COMMIT UPDATES',
      background: '#0a0a0a',
      color: '#fff',
      customClass: {
        popup: 'glass rounded-[2.5rem] border border-white/10 shadow-2xl',
        confirmButton: 'bg-white text-black px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest'
      },
      preConfirm: () => {
        const title = (document.getElementById('swal-title') as HTMLInputElement).value;
        const message = (document.getElementById('swal-message') as HTMLTextAreaElement).value;
        if (!title || !message) return Swal.showValidationMessage('Payload must not be empty.');
        return { title, message };
      }
    });

    if (formValues) {
      try {
        if (type === 'broadcast') {
          await dbService.updateBroadcast(item.id, formValues);
        } else {
          await dbService.updateDirectMessage(item.id, formValues);
        }
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Registry synchronized', showConfirmButton: false, timer: 1500, background: '#111', color: '#fff' });
      } catch (e) {
        Swal.fire('Update Failed', 'Database connection interrupted.', 'error');
      }
    }
  };

  const handleDelete = async (id: string, type: 'broadcast' | 'direct') => {
    const confirm = await Swal.fire({
      title: 'PURGE LOG ENTRY?',
      text: 'This record will be permanently removed from the audit trail.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'DELETE PERMANENTLY',
      confirmButtonColor: '#ef4444',
      background: '#0a0a0a',
      color: '#fff',
      customClass: {
        popup: 'glass rounded-[2rem] border border-white/10'
      }
    });

    if (confirm.isConfirmed) {
      try {
        if (type === 'broadcast') {
          await dbService.deleteBroadcast(id);
        } else {
          await dbService.deleteDirectMessage(id);
        }
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Log purged', showConfirmButton: false, timer: 1500, background: '#111', color: '#fff' });
      } catch (e) {
        Swal.fire('Action Failed', 'Synchronization error occurred.', 'error');
      }
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-4 md:px-12">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-bold uppercase tracking-tighter">Message History</h1>
            <p className="text-zinc-500 mt-2 uppercase text-[10px] tracking-[0.2em] font-bold">Audit log of all outgoing communications</p>
          </div>
          <div className="flex gap-2 bg-zinc-900 p-1 rounded-full border border-white/5 w-full md:w-auto overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setView('broadcast')} 
              className={`px-8 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${view === 'broadcast' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
            >
              Broadcasts
            </button>
            <button 
              onClick={() => setView('direct')} 
              className={`px-8 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${view === 'direct' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
            >
              Direct Messages
            </button>
          </div>
        </header>

        <div className="space-y-6">
          {view === 'broadcast' ? (
            broadcasts.length > 0 ? broadcasts.map((b) => (
              <div key={b.id} className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-6 hover:border-white/10 transition-all group">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white">{b.title}</h3>
                    <div className="flex items-center gap-3">
                       <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${b.target === 'ALL' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                          Target: {b.target === 'ALL' ? 'All Members' : 'Dealers Only'}
                       </span>
                       <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{b.recipientCount} Recipients</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(b, 'broadcast')} className="text-[9px] uppercase font-bold text-zinc-500 hover:text-white transition-colors">Edit</button>
                      <button onClick={() => handleDelete(b.id, 'broadcast')} className="text-[9px] uppercase font-bold text-red-500/40 hover:text-red-500 transition-colors">Purge</button>
                    </div>
                    <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-tighter">{new Date(b.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                  <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-line">{b.message}</p>
                </div>
              </div>
            )) : (
              <div className="p-32 glass rounded-[4rem] text-center border-white/5 text-zinc-700 uppercase text-[10px] italic">No broadcast logs found.</div>
            )
          ) : (
            directMsgs.length > 0 ? directMsgs.map((m) => (
              <div key={m.id} className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-6 hover:border-white/10 transition-all group">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white">{m.title}</h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Recipient: <span className="text-white">{m.recipientName}</span> (ID: {m.recipientId.slice(-6)})</p>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(m, 'direct')} className="text-[9px] uppercase font-bold text-zinc-500 hover:text-white transition-colors">Edit</button>
                      <button onClick={() => handleDelete(m.id, 'direct')} className="text-[9px] uppercase font-bold text-red-500/40 hover:text-red-500 transition-colors">Purge</button>
                    </div>
                    <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-tighter">{new Date(m.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                  <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-line">{m.message}</p>
                </div>
              </div>
            )) : (
              <div className="p-32 glass rounded-[4rem] text-center border-white/5 text-zinc-700 uppercase text-[10px] italic">No direct message logs found.</div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageHistory;
