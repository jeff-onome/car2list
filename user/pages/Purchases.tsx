
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/database';
import { useSiteConfig } from '../../context/SiteConfigContext';

const Purchases: React.FC = () => {
  const { user } = useAuth();
  const { formatPrice } = useSiteConfig();
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      const unsubscribe = dbService.subscribeToPurchases(user.id, (data) => {
        setPurchaseHistory(data);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold uppercase tracking-tighter mb-12">Purchase Registry</h1>
        
        {loading ? (
          <div className="text-center py-20 text-zinc-600 uppercase tracking-widest text-[10px] animate-pulse">Syncing transactions...</div>
        ) : (
          <div className="space-y-6">
            {purchaseHistory.length > 0 ? (
              purchaseHistory.map(p => (
                <div key={p.id} className="glass p-8 rounded-[2.5rem] border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 hover:bg-white/[0.02] transition-colors">
                  <div className="flex gap-6 items-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-lg">
                      <svg className="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold uppercase tracking-tight">{p.model}</h3>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Ref: {p.id} • {new Date(p.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-12">
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Valuation</p>
                      <p className="text-xl font-bold text-white">{formatPrice(p.price || 0)}</p>
                    </div>
                    <button className="bg-white/5 border border-white/10 px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all text-white">
                      View Certificate
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass p-20 rounded-[3rem] text-center border-white/5">
                <svg className="w-16 h-16 text-zinc-800 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                <p className="text-zinc-600 uppercase tracking-widest text-[10px] italic">No acquisitions found in this identity's history.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Purchases;
