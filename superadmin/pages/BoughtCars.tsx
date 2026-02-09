
import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/database';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { useCars } from '../../context/CarContext';
import { Payment, User, Car } from '../../types';
import LoadingScreen from '../../components/LoadingScreen';

const BoughtCars: React.FC = () => {
  const { formatPrice } = useSiteConfig();
  const { cars } = useCars();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState<Payment | null>(null);

  useEffect(() => {
    const unsubPayments = dbService.subscribeToAllPayments((data) => {
      // Filter for Purchases specifically
      setPayments(data.filter(p => p.itemType === 'Purchase').sort((a,b) => b.createdAt.localeCompare(a.createdAt)));
      setLoading(false);
    });
    const unsubUsers = dbService.subscribeToUsers(setUsers);
    return () => {
      unsubPayments();
      unsubUsers();
    };
  }, []);

  const getDetails = (p: Payment) => {
    const user = users.find(u => u.id === p.userId);
    const car = cars.find(c => c.id === p.itemId);
    return { user, car };
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold uppercase tracking-tighter">Sold Masterpieces</h1>
          <p className="text-zinc-500 uppercase text-[10px] tracking-widest font-bold mt-2">Registry of Permanent Acquisitions</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {payments.map(p => {
            const { car } = getDetails(p);
            return (
              <div key={p.id} className="glass p-6 rounded-[2rem] border-white/5 flex flex-col gap-6 hover:bg-white/[0.02] transition-all">
                <div className="aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-white/5">
                  <img src={car?.images?.[0] || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=600'} className="w-full h-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-700" alt="" />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold uppercase text-white tracking-tight">{p.itemDescription}</h3>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Acquired by: {p.userName}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border ${
                      p.status === 'Verified' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>{p.status}</span>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                    <p className="text-lg font-bold text-white">{formatPrice(p.amount)}</p>
                    <button 
                      onClick={() => setSelectedPurchase(p)}
                      className="bg-white text-black px-6 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {payments.length === 0 && (
            <div className="col-span-full py-32 text-center glass rounded-[3rem] border-white/5">
              <p className="text-zinc-600 uppercase tracking-widest text-[10px] italic">Acquisition registry is currently empty.</p>
            </div>
          )}
        </div>
      </div>

      {selectedPurchase && (() => {
        const { user, car } = getDetails(selectedPurchase);
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setSelectedPurchase(null)} />
            <div className="relative w-full max-w-6xl glass rounded-[3rem] border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-full">
              <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-zinc-950">
                <h2 className="text-xl font-bold uppercase tracking-tighter">Acquisition Dossier</h2>
                <button onClick={() => setSelectedPurchase(null)} className="p-3 text-zinc-400 hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <div className="flex-grow overflow-y-auto p-8 md:p-12 no-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="space-y-12">
                    <section className="space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 border-b border-white/5 pb-2">Client Identity</h4>
                      <p className="text-sm font-bold text-white uppercase">{user?.name}</p>
                      <p className="text-[10px] text-zinc-500 font-mono">{user?.email}</p>
                    </section>
                    <section className="space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 border-b border-white/5 pb-2">Transaction Ref</h4>
                      <p className="text-[10px] font-mono text-white break-all uppercase leading-relaxed">{selectedPurchase.referenceId}</p>
                      <p className="text-xs font-bold text-white uppercase">{formatPrice(selectedPurchase.amount)}</p>
                    </section>
                  </div>
                  <div className="lg:col-span-2 space-y-8">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 border-b border-white/5 pb-2">Asset Gallery</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {car?.images.map((img, i) => (
                        <div key={i} className="aspect-video rounded-xl overflow-hidden border border-white/10 shadow-lg">
                          <img src={img} className="w-full h-full object-cover" alt="" />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 border-b border-white/5 pb-2">Technical Telemetry</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <SpecNode label="Power" val={`${car?.hp} HP`} />
                        <SpecNode label="0-100" val={car?.acceleration} />
                        <SpecNode label="Source" val={car?.fuel} />
                        <SpecNode label="Transmission" val={car?.transmission} />
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed uppercase tracking-widest">{car?.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

const SpecNode = ({ label, val }: any) => (
  <div>
    <p className="text-[8px] uppercase tracking-widest text-zinc-600 font-bold mb-1">{label}</p>
    <p className="text-xs font-bold uppercase text-white">{val}</p>
  </div>
);

export default BoughtCars;
