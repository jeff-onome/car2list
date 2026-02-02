
import React from 'react';

const TestDrives: React.FC = () => {
  const bookings = [
    { id: 1, car: 'Lamborghini Urus', date: '2024-06-20', time: '14:00', status: 'Confirmed' },
    { id: 2, car: 'Bentley Continental', date: '2024-06-25', time: '10:00', status: 'Pending Approval' }
  ];

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold uppercase tracking-tighter mb-12">Scheduled Experiences</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {bookings.map(b => (
            <div key={b.id} className="glass p-8 rounded-[3rem] border-white/5 space-y-6">
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-bold uppercase tracking-tighter">{b.car}</h3>
                <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${b.status === 'Confirmed' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                  {b.status}
                </span>
              </div>
              <div className="flex gap-12 border-t border-white/5 pt-6">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Date</p>
                  <p className="text-sm font-bold">{b.date}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Time</p>
                  <p className="text-sm font-bold">{b.time}</p>
                </div>
              </div>
              <button className="w-full border border-white/10 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all">
                Reschedule
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestDrives;
