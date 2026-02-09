
import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/database';
import { ContactMessage } from '../../types';
import { Link } from 'react-router-dom';
import LoadingScreen from '../../components/LoadingScreen';

const InquiryList: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = dbService.subscribeToContactMessages((data) => {
      setMessages(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-4 md:px-12">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-bold uppercase tracking-tighter text-white">Client Inquiries</h1>
            <p className="text-zinc-500 uppercase text-[10px] tracking-widest font-bold mt-2">Managing Concierge Communication Channels</p>
          </div>
          <div className="bg-zinc-900 border border-white/5 px-6 py-2.5 rounded-full">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Total Entries: <span className="text-white">{messages.length}</span></p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {messages.length > 0 ? messages.map((msg) => (
            <Link 
              key={msg.id}
              to={`/admin/inquiry/${msg.id}`}
              className="glass p-8 rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all group flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white">{msg.name}</h3>
                    <p className="text-[10px] text-zinc-500 font-mono">{msg.email}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${msg.read ? 'bg-zinc-800' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse'}`} />
                </div>
                
                <div className="space-y-2">
                   <p className="text-[8px] uppercase tracking-widest text-zinc-600 font-bold">Interest</p>
                   <p className="text-xs text-zinc-300 font-bold uppercase truncate">{msg.interest || 'General Concierge'}</p>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                   <p className="text-[11px] text-zinc-400 line-clamp-3 leading-relaxed italic">"{msg.message}"</p>
                </div>
              </div>

              <div className="mt-8 flex justify-between items-center border-t border-white/5 pt-4">
                 <p className="text-[9px] font-mono text-zinc-600">{new Date(msg.timestamp).toLocaleDateString()}</p>
                 <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-500 group-hover:text-white transition-colors">Inspect Registry Entry →</span>
              </div>
            </Link>
          )) : (
            <div className="col-span-full p-32 glass rounded-[4rem] text-center border-white/5">
               <p className="text-zinc-700 uppercase tracking-[0.3em] text-[10px] italic">Inquiry registry currently clear.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InquiryList;
