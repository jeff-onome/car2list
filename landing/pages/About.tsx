
import React from 'react';
import { useSiteConfig } from '../../context/SiteConfigContext';

const About: React.FC = () => {
  const { config } = useSiteConfig();
  const { aboutPage } = config;

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto space-y-16">
        <div className="text-center space-y-6">
          <span className="text-xs uppercase tracking-[0.5em] text-zinc-500">Curated by {config.siteName}</span>
          <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter">The Pursuit of Perfection</h1>
          <p className="text-xl text-zinc-400 font-light leading-relaxed">
            {aboutPage.heroText}
          </p>
        </div>

        <div className="aspect-[21/9] rounded-3xl overflow-hidden glass">
          <img src={aboutPage.imageUrl} alt="Showroom" className="w-full h-full object-cover opacity-60" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold uppercase tracking-widest">{aboutPage.missionTitle}</h3>
            <p className="text-zinc-400 leading-relaxed">
              {aboutPage.missionText}
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold uppercase tracking-widest">{aboutPage.valuesTitle}</h3>
            <p className="text-zinc-400 leading-relaxed">
              {aboutPage.valuesText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
