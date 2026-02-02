
import React from 'react';

const Verification: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6">
      <div className="max-w-2xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold uppercase tracking-tighter">KYC Verification</h1>
          <p className="text-zinc-500 text-sm">Required for all high-value transactions and private bidding.</p>
        </div>

        <div className="glass p-8 md:p-12 rounded-3xl space-y-8">
          <Step num={1} title="Identity Document" desc="Upload a clear scan of your passport or government ID." completed />
          <Step num={2} title="Proof of Residency" desc="Recent utility bill or bank statement (issued within 3 months)." active />
          <Step num={3} title="Financial Capability" desc="Optional: Expedites high-value purchase approvals." />

          <div className="pt-8 border-t border-white/5">
            <button className="w-full bg-white text-black py-4 rounded-full font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all">
              Continue to Step 2
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Step: React.FC<{ num: number; title: string; desc: string; active?: boolean; completed?: boolean }> = ({ num, title, desc, active, completed }) => (
  <div className={`flex gap-6 ${active ? 'opacity-100' : 'opacity-40'}`}>
    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold shrink-0 ${completed ? 'bg-green-500 border-green-500 text-black' : (active ? 'border-white text-white' : 'border-zinc-800 text-zinc-800')}`}>
      {completed ? '✓' : num}
    </div>
    <div className="space-y-1">
      <h4 className="font-bold uppercase tracking-widest text-sm">{title}</h4>
      <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default Verification;
