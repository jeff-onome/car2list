
import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/database';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { Payment, PlatformFinancials } from '../../types';
import Swal from 'https://esm.sh/sweetalert2@11';

const PaymentManagement: React.FC = () => {
  const { formatPrice, config, updateConfig } = useSiteConfig();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'Registry' | 'Vault'>('Registry');

  useEffect(() => {
    const unsub = dbService.subscribeToAllPayments((data) => {
      setPayments(data.sort((a,b) => b.createdAt.localeCompare(a.createdAt)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

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

  const handleUpdateVault = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updated: PlatformFinancials = {
      bankName: formData.get('bankName') as string,
      accountName: formData.get('accountName') as string,
      accountNumber: formData.get('accountNumber') as string,
      swiftCode: formData.get('swiftCode') as string,
      btcWallet: formData.get('btcWallet') as string,
      ethWallet: formData.get('ethWallet') as string,
      usdtWallet: formData.get('usdtWallet') as string,
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
                <h3 className="text-xl font-bold uppercase tracking-tighter border-b border-white/5 pb-4">Crypto Liquidity</h3>
                <VaultField label="BTC Wallet" name="btcWallet" val={config.financials.btcWallet} />
                <VaultField label="ETH Wallet" name="ethWallet" val={config.financials.ethWallet} />
                <VaultField label="USDT (TRC20) Wallet" name="usdtWallet" val={config.financials.usdtWallet} />
                <div className="pt-10">
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
