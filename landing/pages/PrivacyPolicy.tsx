
import React from 'react';
import { useSiteConfig } from '../../context/SiteConfigContext';

const PrivacyPolicy: React.FC = () => {
  const { config } = useSiteConfig();

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        <h1 className="text-4xl font-bold uppercase tracking-tighter">Privacy Policy</h1>
        <div className="glass p-10 rounded-[2.5rem] space-y-8 text-zinc-400 text-sm leading-relaxed whitespace-pre-line">
           {config.privacyPolicy}
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
