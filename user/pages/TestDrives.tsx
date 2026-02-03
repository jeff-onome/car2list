
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/database';

const TestDrives: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      const unsubscribe = dbService.subscribeToBookings(user.id, (data) => {
        setBookings(data);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold uppercase tracking-tighter mb-12">Scheduled Experiences</h1>
        
        {loading ? (
          <div className="text-center py-20 text-zinc-600 uppercase tracking-widest text-[10px] animate-pulse">Syncing schedule...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {bookings.length > 0 ? (
              bookings.map(b => (
                <div key={b.id} className="glass p-8 rounded-[3rem] border-white/5 space-y-6 hover:border-white/20 transition-all shadow-xl">
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-bold uppercase tracking-tighter">{b.car}</h3>
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${b.status === 'Confirmed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                      {b.status}
                    </span>
                  </div>
                  <div className="flex gap-12 border-t border-white/5 pt-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-bold">Scheduled Date</p>
                      <p className="text-sm font-bold tracking-tight text-white">{new Date(b.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-bold">Slot Time</p>
                      <p className="text-sm font-bold tracking-tight text-white">{b.time}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex-grow border border-white/10 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all text-zinc-400">
                      Reschedule
                    </button>
                    <button className="px-6 border border-red-500/20 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/10 transition-all text-red-500/50">
                      Cancel
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="md:col-span-2 glass p-20 rounded-[3rem] text-center border-white/5">
                <svg className="w-16 h-16 text-zinc-800 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <p className="text-zinc-600 uppercase tracking-widest text-[10px] italic">No upcoming test drive experiences scheduled.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestDrives;
