
import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/database';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { Payment, PlatformFinancials, CryptoWallet } from '../../types';
import Swal from 'https://esm.sh/sweetalert2@11';

const PaymentManagement: React.FC = () => {
  const { formatPrice, config, updateConfig } = useSiteConfig();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'Registry' | 'Vault'>('Registry');
  
  // Local state for dynamic wallet management
  const [wallets, setWallets] = useState<CryptoWallet[]>(config.financials.wallets || []);

  useEffect(() => {
    const unsub = dbService.subscribeToAllPayments((data) => {
      setPayments(data.sort((a,b) => b.createdAt.localeCompare(a.createdAt)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Synchronize local state with config changes
  useEffect(() => {
    setWallets(config.financials.wallets || []);
  }, [config.financials.wallets]);

  const handleAction = async (pid: string, status: Payment['status'], uid: string) => {
    const confirm = await Swal.fire({
      title: `${status} Payment Proof?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: status === 'Verified' ? '#22c55e' : '#ef4444',
      background: '#0a0a0a', color: '#fff'
    });

    if (confirm.isConfirmed) {
      await dbService.updatePaymentStatus(pid, status);
      await dbService.createNotification(uid, {
        title: `Payment ${status}`,
        message: `Your transaction proof has been ${status.toLowerCase()} by our finance team.`,
        type: status === 'Verified' ? 'success' : 'warning'
      });
      Swal.fire('Updated', `Transaction is now ${status}`, 'success');
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
      wallets: wallets.filter(w => w.label && w.address), // Filter out empty entries
    };
    await updateConfig({ financials: updated });
    Swal.fire('Vault Updated', 'Platform payment credentials synchronized.', 'success');
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6">
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
                    <th className="px-8 py-6 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {payments.map(p => (
                    <tr key={p.id} className="text-sm hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-6">
                        <p className="font-mono text-zinc-400">{p.id.slice(0, 8)}...</p>
                        <p className="text-[9px] text-zinc-600 uppercase font-bold mt-1">{p.itemType}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-bold text-white">{p.userName}</p>
                        <p className="text-[10px] text-zinc-500 uppercase">{formatPrice(p.amount)}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{p.method}</span>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-[10px] font-mono text-zinc-500 truncate max-w-[150px]">{p.referenceId}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border ${
                          p.status === 'Verified' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                          p.status === 'Rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}>{p.status}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {p.status === 'Pending' && (
                          <div className="flex gap-3 justify-end">
                            <button onClick={() => handleAction(p.id, 'Verified', p.userId)} className="bg-green-500/10 text-green-500 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-green-500 hover:text-black">Verify</button>
                            <button onClick={() => handleAction(p.id, 'Rejected', p.userId)} className="bg-red-500/10 text-red-500 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white">Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdateVault} className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4">
             <div className="glass p-10 rounded-[3rem] border-white/5 space-y-6">
                <h3 className="text-xl font-bold uppercase tracking-tighter border-b border-white/5 pb-4">Banking Credentials</h3>
                <VaultField label="Bank Name" name="bankName" val={config.financials.bankName} />
                <VaultField label="Account Holder" name="accountName" val={config.financials.accountName} />
                <VaultField label="IBAN / Account No." name="accountNumber" val={config.financials.accountNumber} />
                <VaultField label="SWIFT / BIC Code" name="swiftCode" val={config.financials.swiftCode} />
             </div>
             <div className="glass p-10 rounded-[3rem] border-white/5 space-y-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <h3 className="text-xl font-bold uppercase tracking-tighter">Crypto Liquidity</h3>
                  <button type="button" onClick={addWallet} className="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all">Add Wallet</button>
                </div>
                
                <div className="space-y-6 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                  {wallets.map((wallet, idx) => (
                    <div key={idx} className="p-6 bg-zinc-900/50 rounded-2xl border border-white/5 space-y-4 relative group">
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
    </div>
  );
};

const VaultField = ({ label, name, val }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4 font-bold">{label}</label>
    <input name={name} defaultValue={val} className="w-full bg-zinc-900 border border-white/5 rounded-full px-6 py-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all" />
  </div>
);

export default PaymentManagement;