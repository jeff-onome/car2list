
import React, { useState } from 'react';
import { useSiteConfig } from '../../context/SiteConfigContext';
import SEO from '../../components/SEO';

const FAQ: React.FC = () => {
  const { config } = useSiteConfig();
  const [active, setActive] = useState<number | null>(null);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": config.faqPage.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6">
      <SEO 
        title="Frequently Asked Questions | Concierge Support" 
        description="Find answers about luxury car acquisitions, global logistics, vehicle verification, and private collection management at AutoSphere."
        schema={faqSchema}
      />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-12 uppercase tracking-tighter text-center">Collector Inquiries & FAQ</h1>
        <div className="space-y-4">
          {config.faqPage.map((item, i) => (
            <article key={i} className="glass rounded-2xl overflow-hidden">
              <button 
                onClick={() => setActive(active === i ? null : i)}
                className="w-full p-6 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
                aria-expanded={active === i}
              >
                <span className="font-bold uppercase tracking-widest text-sm">{item.q}</span>
                <svg className={`w-5 h-5 transition-transform ${active === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {active === i && (
                <div className="px-6 pb-6 text-zinc-400 text-sm leading-relaxed animate-in fade-in slide-in-from-top-2">
                  {item.a}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
