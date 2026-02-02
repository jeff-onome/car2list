
import React from 'react';
import { useSiteConfig } from '../../context/SiteConfigContext';

const Financing: React.FC = () => {
  const { config } = useSiteConfig();
  const { financingPage } = config;

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6">
      <div className="max-w-5xl mx-auto space-y-16">
        <div className="text-center space-y-6">
          <span className="text-xs uppercase tracking-[0.5em] text-zinc-500">Bespoke Solutions</span>
          <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter text-center">{config.siteName} Capital</h1>
          <p className="text-xl text-zinc-400 font-light leading-relaxed max-w-2xl mx-auto">
            {financingPage.heroText}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {financingPage.cards.map((card, idx) => (
            <FinanceCard 
              key={idx}
              title={card.title} 
              desc={card.desc} 
            />
          ))}
        </div>

        <div className="glass p-12 rounded-3xl space-y-8">
          <h3 className="text-2xl font-bold uppercase tracking-widest">Why Choose {config.siteName} Capital?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-zinc-400">
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5" />
                Discreet and expedited credit approval processes.
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5" />
                No-penalty early settlement options on all tiers.
              </li>
            </ul>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5" />
                Customized structures for corporate and offshore entities.
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5" />
                Dedicated wealth manager for every transaction.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const FinanceCard: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
  <div className="glass p-8 rounded-3xl border border-white/5 hover:border-white/20 transition-all">
    <h4 className="text-lg font-bold uppercase tracking-widest mb-4">{title}</h4>
    <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default Financing;
