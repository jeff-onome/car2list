
import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from '../../services/database';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { useCars } from '../../context/CarContext';
import { Payment, PlatformFinancials, CryptoWallet, User, Rental, Car } from '../../types';
import Swal from 'https://esm.sh/sweetalert2@11';

const PaymentManagement: React.FC = () => {
  const { formatPrice, config, updateConfig } = useSiteConfig();
  const { cars } = useCars();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'Registry' | 'Vault'>('Registry');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  
  // Local state for dynamic wallet management
  const [wallets, setWallets] = useState<CryptoWallet[]>(config.financials.wallets || []);

  useEffect(() => {
    const unsubPayments = dbService.subscribeToAllPayments((data) => {
      setPayments(data.sort((a,b) => b.createdAt.localeCompare(a.createdAt)));
      setLoading(false);
    });
    const unsubUsers = dbService.subscribeToUsers(setUsers);
    const unsubRentals = dbService.subscribeToAllRentals(setRentals);

    return () => {
      unsubPayments();
      unsubUsers();
      unsubRentals();
    };
  }, []);

  // Synchronize local state with config changes
  useEffect(() => {
    setWallets(config.financials.wallets || []);
  }, [config.financials.wallets]);

  const handleAction = async (pid: string, status: Payment['status'], uid: string) => {
    const confirm = await Swal.fire({
      title: `${status} Payment Proof?`,
      text: `Transitioning payment status to ${status}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: status === 'Verified' ? '#22c55e' : '#ef4444',
      background: '#0a0a0a', color: '#fff',
      customClass: { popup: 'glass rounded-[2rem] border border-white/10' }
    });

    if (confirm.isConfirmed) {
      await dbService.updatePaymentStatus(pid, status);
      await dbService.createNotification(uid, {
        title: `Payment ${status}`,
        message: `Your transaction proof has been ${status.toLowerCase()} by our finance team.`,
        type: status === 'Verified' ? 'success' : 'warning'
      });
      Swal.fire({ title: 'Updated', icon: 'success', background: '#0a0a0a', color: '#fff' });
    }
  };

  const addWallet = () => {
    setWallets([...wallets, { label: '', address: '' }]);
  };

  const updateWallet = (index: number, field: keyof CryptoWallet, value: string) => {
    const newWallets = [...wallets];
    newWallets[index][field] = value;
    setWallets(newWallets);
  };

  const removeWallet = (index: number) => {
    setWallets(wallets.filter((_, i) => i !== index));
  };

  const handleUpdateVault = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updated: PlatformFinancials = {
      bankName: formData.get('bankName') as string,
      accountName: formData.get('accountName') as string,
      accountNumber: formData.get('accountNumber') as string,
      swiftCode: formData.get('swiftCode') as string,
      wallets: wallets.filter(w => w.label && w.address),
    };
    await updateConfig({ financials: updated });
    Swal.fire({ title: 'Vault Updated', icon: 'success', background: '#0a0a0a', color: '#fff' });
  };

  const getDetailedInfo = (payment: Payment) => {
    const user = users.find(u => u.id === payment.userId);
    let car: Car | undefined;

    if (payment.itemType === 'Purchase') {
      car = cars.find(c => c.id === payment.itemId);
    } else if (payment.itemType === 'Rental') {
      const rental = rentals.find(r => r.id === payment.itemId);
      if (rental) {
        car = cars.find(c => c.id === rental.carId);
      }
    }

    return { user, car };
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold uppercase tracking-tighter">Finance Hub</h1>
            <p className="text-zinc-500 uppercase text-[10px] tracking-widest font-bold mt-2">Platform-Wide Liquidity Registry</p>
          </div>
          <div className="flex gap-2 bg-zinc-900 p-1 rounded-full border border-white/5">
            <button onClick={() => setActiveView('Registry')} className={`px-8 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeView === 'Registry' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>Registry</button>
            <button onClick={() => setActiveView('Vault')} className={`px-8 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeView === 'Vault' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>The Vault</button>
          </div>
        </header>

        {activeView === 'Registry' ? (
          <div className="glass rounded-[3rem] overflow-hidden border-white/5 shadow-2xl">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-zinc-500 border-b border-white/5">
                  <tr>
                    <th className="px-8 py-6">Transaction ID</th>
                    <th className="px-8 py-6">Identity</th>
                    <th className="px-8 py-6">Channel</th>
                    <th className="px-8 py-6">Proof / Hash</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {payments.map(p => (
                    <tr key={p.id} className="text-sm hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <p className="font-mono text-zinc-400">{p.id.slice(0, 8)}...</p>
                        <p className="text-[9px] text-zinc-600 uppercase font-bold mt-1">{p.itemType}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-bold text-white uppercase tracking-tight">{p.userName}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">{formatPrice(p.amount)}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{p.method}</span>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-[10px] font-mono text-zinc-500 truncate max-w-[120px]">{p.referenceId}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border ${
                          p.status === 'Verified' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                          p.status === 'Rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}>{p.status}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex gap-4 justify-end items-center">
                          <button 
                            onClick={() => setSelectedPayment(p)}
                            className="text-[10px] uppercase font-bold text-zinc-500 hover:text-white transition-colors"
                          >
                            Manage
                          </button>
                          {p.status === 'Pending' && (
                            <div className="flex gap-2 border-l border-white/10 pl-4">
                              <button onClick={() => handleAction(p.id, 'Verified', p.userId)} className="bg-green-500/10 text-green-500 p-2 rounded-full hover:bg-green-500 hover:text-black transition-all" title="Verify Payment">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                              </button>
                              <button onClick={() => handleAction(p.id, 'Rejected', p.userId)} className="bg-red-500/10 text-red-500 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all" title="Reject Payment">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr><td colSpan={6} className="p-20 text-center text-zinc-600 uppercase tracking-widest text-[10px] italic">Finance registry is empty.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdateVault} className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4">
             <div className="glass p-10 rounded-[3rem] border-white/5 space-y-6 shadow-2xl">
                <h3 className="text-xl font-bold uppercase tracking-tighter border-b border-white/5 pb-4">Banking Credentials</h3>
                <VaultField label="Bank Name" name="bankName" val={config.financials.bankName} />
                <VaultField label="Account Holder" name="accountName" val={config.financials.accountName} />
                <VaultField label="IBAN / Account No." name="accountNumber" val={config.financials.accountNumber} />
                <VaultField label="SWIFT / BIC Code" name="swiftCode" val={config.financials.swiftCode} />
             </div>
             <div className="glass p-10 rounded-[3rem] border-white/5 space-y-6 shadow-2xl">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <h3 className="text-xl font-bold uppercase tracking-tighter">Crypto Liquidity</h3>
                  <button type="button" onClick={addWallet} className="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all">Add Wallet</button>
                </div>
                
                <div className="space-y-6 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                  {wallets.map((wallet, idx) => (
                    <div key={idx} className="p-6 bg-zinc-900/50 rounded-2xl border border-white/5 space-y-4 relative group hover:border-white/20 transition-all">
                      <button 
                        type="button" 
                        onClick={() => removeWallet(idx)} 
                        className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/10 rounded-full"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                      <div className="space-y-2">
                        <label className="text-[8px] uppercase tracking-[0.2em] text-zinc-500 ml-4 font-bold">Network Name</label>
                        <input 
                          value={wallet.label} 
                          onChange={(e) => updateWallet(idx, 'label', e.target.value)}
                          placeholder="e.g. BTC Mainnet"
                          className="w-full bg-black/40 border border-white/5 rounded-full px-5 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/10" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] uppercase tracking-[0.2em] text-zinc-500 ml-4 font-bold">Wallet Address</label>
                        <input 
                          value={wallet.address} 
                          onChange={(e) => updateWallet(idx, 'address', e.target.value)}
                          placeholder="0x..."
                          className="w-full bg-black/40 border border-white/5 rounded-full px-5 py-3 text-xs font-mono text-zinc-400 focus:outline-none focus:ring-1 focus:ring-white/10" 
                        />
                      </div>
                    </div>
                  ))}
                  {wallets.length === 0 && (
                    <p className="text-center text-zinc-600 uppercase text-[9px] py-10 italic">No wallets configured.</p>
                  )}
                </div>

                <div className="pt-6">
                   <button type="submit" className="w-full bg-white text-black py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all shadow-xl">Synchronize Financial Vault</button>
                </div>
             </div>
          </form>
        )}
      </div>

      {/* Payment Detailed View Modal */}
      {selectedPayment && (() => {
        const { user, car } = getDetailedInfo(selectedPayment);
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setSelectedPayment(null)} />
            
            <div className="relative w-full max-w-6xl glass rounded-[3rem] border-white/10 shadow-[0_0_100px_rgba(255,255,255,0.05)] overflow-hidden flex flex-col max-h-full">
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-zinc-950">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-black font-bold uppercase ${selectedPayment.status === 'Verified' ? 'bg-green-500' : selectedPayment.status === 'Rejected' ? 'bg-red-500' : 'bg-amber-500 animate-pulse'}`}>
                    {selectedPayment.status === 'Verified' ? '✓' : selectedPayment.status === 'Rejected' ? '!' : '?'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold uppercase tracking-tighter">Manage Transaction</h2>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Internal Reference: {selectedPayment.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedPayment(null)}
                  className="p-3 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Modal Content Scrollable */}
              <div className="flex-grow overflow-y-auto no-scrollbar p-8 md:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  
                  {/* Column 1: Identity & Transaction */}
                  <div className="space-y-12">
                    <section className="space-y-6">
                      <h4 className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-500 border-b border-white/5 pb-3">Identity Profile</h4>
                      {user ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-lg font-bold uppercase overflow-hidden">
                                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                             </div>
                             <div>
                                <p className="text-sm font-bold text-white uppercase tracking-tight">{user.name}</p>
                                <p className="text-[10px] text-zinc-500 font-mono truncate max-w-[180px]">{user.email}</p>
                             </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div>
                                <p className="text-[8px] uppercase tracking-widest text-zinc-600 font-bold mb-1">Access Level</p>
                                <p className="text-[10px] text-white font-bold">{user.role}</p>
                             </div>
                             <div>
                                <p className="text-[8px] uppercase tracking-widest text-zinc-600 font-bold mb-1">Clearance</p>
                                <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full ${user.isVerified ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                  {user.isVerified ? 'Verified' : 'Pending'}
                                </span>
                             </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-600 italic uppercase">Identity record missing</p>
                      )}
                    </section>

                    <section className="space-y-6">
                      <h4 className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-500 border-b border-white/5 pb-3">Transaction Telemetry</h4>
                      <div className="space-y-4">
                         <div className="flex justify-between items-center text-[10px] uppercase">
                            <span className="text-zinc-600 font-bold">Valuation</span>
                            <span className="text-white font-mono text-base font-bold">{formatPrice(selectedPayment.amount)}</span>
                         </div>
                         <div className="flex justify-between items-center text-[10px] uppercase">
                            <span className="text-zinc-600 font-bold">Channel</span>
                            <span className="text-white font-bold">{selectedPayment.method}</span>
                         </div>
                         <div className="flex justify-between items-center text-[10px] uppercase">
                            <span className="text-zinc-600 font-bold">Timestamp</span>
                            <span className="text-zinc-400 font-mono">{new Date(selectedPayment.createdAt).toLocaleString()}</span>
                         </div>
                         <div className="space-y-2 pt-2">
                            <p className="text-[8px] uppercase tracking-widest text-zinc-600 font-bold">Audit Reference / Proof Hash</p>
                            <div className="bg-zinc-900 border border-white/5 p-4 rounded-xl break-all">
                               <p className="text-[10px] font-mono text-zinc-300 leading-relaxed uppercase">{selectedPayment.referenceId}</p>
                            </div>
                         </div>
                      </div>
                    </section>
                  </div>

                  {/* Column 2 & 3: Asset Details */}
                  <div className="lg:col-span-2 space-y-8">
                    <section className="space-y-6">
                      <h4 className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-500 border-b border-white/5 pb-3">Asset Curation: {selectedPayment.itemDescription}</h4>
                      {car ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                           <div className="aspect-[4/3] rounded-[2rem] overflow-hidden border border-white/10 bg-zinc-900 group shadow-2xl">
                              <img src={car.images[0]} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" alt="" />
                           </div>
                           <div className="space-y-6">
                              <div className="space-y-1">
                                 <p className="text-2xl font-bold uppercase tracking-tighter text-white leading-none">{car.make} {car.model}</p>
                                 <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-bold">{car.year} Edition • {car.type}</p>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                 <DetailNode label="Engine Output" val={`${car.hp} HP`} />
                                 <DetailNode label="Velocity (0-100)" val={car.acceleration} />
                                 <DetailNode label="Transmission" val={car.transmission} />
                                 <DetailNode label="Energy Source" val={car.fuel} />
                                 <DetailNode label="Registry Valuation" val={formatPrice(car.price)} highlight />
                                 <DetailNode label="Mileage Log" val={`${car.mileage.toLocaleString()} MI`} />
                              </div>

                              <div className="space-y-3 pt-6 border-t border-white/5">
                                 <p className="text-[8px] uppercase tracking-widest text-zinc-600 font-bold">Masterpiece Narrative</p>
                                 <p className="text-[11px] text-zinc-400 leading-relaxed uppercase tracking-tighter line-clamp-4 italic">
                                    {car.description}
                                 </p>
                              </div>
                           </div>
                        </div>
                      ) : (
                        <div className="p-20 text-center glass rounded-[2rem] border-white/5 border-dashed">
                           <p className="text-zinc-600 uppercase text-[10px] tracking-[0.3em] italic">Vehicle Registry Entry Unavailable or Expired</p>
                        </div>
                      )}
                    </section>
                  </div>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="px-8 py-8 border-t border-white/5 bg-zinc-950/80 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                   <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-zinc-500">Authorized Administrative Pulse Only</span>
                </div>
                
                <div className="flex gap-4 w-full sm:w-auto">
                   {selectedPayment.status === 'Pending' ? (
                     <>
                        <button 
                          onClick={() => handleAction(selectedPayment.id, 'Verified', selectedPayment.userId)}
                          className="flex-grow sm:flex-grow-0 bg-white text-black px-10 py-4 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-green-50 shadow-2xl transition-all"
                        >
                          Confirm & Verify Proof
                        </button>
                        <button 
                          onClick={() => handleAction(selectedPayment.id, 'Rejected', selectedPayment.userId)}
                          className="flex-grow sm:flex-grow-0 bg-red-500/10 border border-red-500/20 text-red-500 px-8 py-4 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                        >
                          Reject Submission
                        </button>
                     </>
                   ) : (
                     <button 
                        onClick={() => setSelectedPayment(null)}
                        className="w-full sm:w-auto bg-white/5 border border-white/10 text-white px-12 py-4 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
                     >
                        Close Registry Entry
                     </button>
                   )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

const VaultField = ({ label, name, val }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4 font-bold">{label}</label>
    <input name={name} defaultValue={val} className="w-full bg-zinc-900 border border-white/5 rounded-full px-6 py-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all hover:bg-zinc-800" />
  </div>
);

const DetailNode = ({ label, val, highlight }: any) => (
  <div className="space-y-1 overflow-hidden">
     <p className="text-[8px] uppercase tracking-widest text-zinc-600 font-bold truncate">{label}</p>
     <p className={`text-xs font-bold uppercase truncate ${highlight ? 'text-amber-500' : 'text-zinc-200'}`}>{val}</p>
  </div>
);

export default PaymentManagement;
