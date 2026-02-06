
import React from 'react';
import { useUserData } from '../../context/UserDataContext';
import LoadingScreen from '../../components/LoadingScreen';

const UserMessages: React.FC = () => {
  const { notifications, markNotificationAsRead, clearNotifications } = useUserData();

  // Filter for administrative messages specifically
  const adminMessages = notifications.filter(n => 
    n.title.includes('Administrative') || 
    n.title.includes('[SYSTEM]')
  );

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6 md:px-12">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-bold uppercase tracking-tighter">Broadcast Hub</h1>
            <p className="text-zinc-500 mt-2 uppercase text-[10px] tracking-[0.2em] font-bold">Secure Administrative Communications</p>
          </div>
          {adminMessages.length > 0 && (
            <button 
              onClick={clearNotifications}
              className="text-[9px] uppercase font-bold tracking-widest text-zinc-700 hover:text-red-500 transition-colors border border-white/5 px-6 py-2 rounded-full hover:bg-red-500/5"
            >
              Flush All Transmissions
            </button>
          )}
        </header>

        <div className="space-y-4">
          {adminMessages.length > 0 ? adminMessages.map((msg) => (
            <div 
              key={msg.id}
              onClick={() => !msg.read && markNotificationAsRead(msg.id)}
              className={`glass p-8 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden group ${!msg.read ? 'border-blue-500/20 bg-blue-500/[0.02]' : 'border-white/5 opacity-60 hover:opacity-100'}`}
            >
              {!msg.read && (
                <div className="absolute top-0 right-0 p-8">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                </div>
              )}
              
              <div className="flex items-start gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0 transition-colors ${!msg.read ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-zinc-900 border-white/5 text-zinc-600'}`}>
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                
                <div className="space-y-4 flex-grow">
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-1">{msg.title}</h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Origin: System Administration • {formatTime(msg.time)}</p>
                  </div>
                  
                  <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                    <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-line">
                      {msg.message}
                    </p>
                  </div>
                  
                  {!msg.read && (
                    <div className="pt-2">
                       <button className="text-[9px] uppercase font-bold tracking-[0.2em] text-blue-400 hover:text-white transition-colors">Mark as Acknowledged</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div className="p-32 glass rounded-[4rem] text-center border-white/5">
               <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-8 text-zinc-700">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
               </div>
               <p className="text-zinc-600 uppercase tracking-[0.3em] text-[10px] italic">Your administrative registry is currently clear.</p>
            </div>
          )}
        </div>
        
        <div className="text-center pt-10">
           <p className="text-[9px] text-zinc-700 uppercase tracking-widest leading-relaxed">
             This communication terminal is end-to-end encrypted. <br/>
             All administrative bulletins are logged for compliance and security audit purposes.
           </p>
        </div>
      </div>
    </div>
  );
};

export default UserMessages;
