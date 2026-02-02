
import React from 'react';

const Purchases: React.FC = () => {
  const purchaseHistory = [
    { id: 'INV-001', date: '2024-03-15', model: 'Ferrari SF90 Stradale', price: 625000, status: 'Delivered' },
    { id: 'INV-002', date: '2023-11-20', model: 'Porsche Taycan Turbo S', price: 185000, status: 'Completed' }
  ];

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold uppercase tracking-tighter mb-12">Purchase History</h1>
        
        <div className="space-y-6">
          {purchaseHistory.map(p => (
            <div key={p.id} className="glass p-8 rounded-[2.5rem] border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex gap-6 items-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                  <svg className="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight">{p.model}</h3>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Invoice {p.id} • {p.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-12">
                <div className="text-right">
                  <p className="text-sm text-zinc-500 uppercase tracking-widest">Amount</p>
                  <p className="text-xl font-bold text-white">${p.price.toLocaleString()}</p>
                </div>
                <button className="bg-white/5 border border-white/10 px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                  Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Purchases;
