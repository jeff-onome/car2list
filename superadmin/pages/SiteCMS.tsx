
import React, { useState } from 'react';
import { useSiteConfig } from '../../context/SiteConfigContext';
import Swal from 'https://esm.sh/sweetalert2@11';

const SiteCMS: React.FC = () => {
  const { config, updateConfig } = useSiteConfig();
  const [localConfig, setLocalConfig] = useState(config);
  const [activeTab, setActiveTab] = useState('Global');

  const handleSave = () => {
    updateConfig(localConfig);
    Swal.fire({
      title: 'Global Update',
      text: 'Site configuration updated successfully across all instances.',
      icon: 'success',
      confirmButtonColor: '#000',
      background: '#111',
      color: '#fff'
    });
  };

  const tabs = ['Global', 'Home Page', 'Inventory', 'About', 'FAQ', 'Financing', 'Policies'];

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
          <h1 className="text-4xl font-bold uppercase tracking-tighter text-white">Site CMS</h1>
          <button 
            onClick={handleSave}
            className="bg-white text-black px-12 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all shadow-2xl"
          >
            Commit Global Changes
          </button>
        </div>

        <div className="flex overflow-x-auto gap-2 mb-8 no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-full text-[10px] uppercase font-bold tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="space-y-8">
          {activeTab === 'Global' && (
            <CMSSection title="Global Identity">
              <CMSField label="Site Name" value={localConfig.siteName} onChange={v => setLocalConfig({...localConfig, siteName: v})} />
              <CMSField label="Hero Title" value={localConfig.heroTitle} onChange={v => setLocalConfig({...localConfig, heroTitle: v})} />
              <CMSField label="Hero Subtitle" value={localConfig.heroSubtitle} onChange={v => setLocalConfig({...localConfig, heroSubtitle: v})} />
              <CMSField label="Featured Banner Text" value={localConfig.featuredBanner} onChange={v => setLocalConfig({...localConfig, featuredBanner: v})} />
            </CMSSection>
          )}

          {activeTab === 'Home Page' && (
            <CMSSection title="Home Page Sections">
              <CMSField label="Heritage Section Title" value={localConfig.homePage.heritageTitle} onChange={v => setLocalConfig({...localConfig, homePage: {...localConfig.homePage, heritageTitle: v}})} />
              <CMSArea label="Heritage Narrative" value={localConfig.homePage.heritageText} onChange={v => setLocalConfig({...localConfig, homePage: {...localConfig.homePage, heritageText: v}})} />
              <CMSField label="Services Section Title" value={localConfig.homePage.servicesTitle} onChange={v => setLocalConfig({...localConfig, homePage: {...localConfig.homePage, servicesTitle: v}})} />
              <div className="space-y-4">
                {localConfig.homePage.services.map((s, i) => (
                  <div key={i} className="p-4 border border-white/5 rounded-2xl">
                    <CMSField label={`Service ${i+1} Title`} value={s.title} onChange={v => {
                      const services = [...localConfig.homePage.services];
                      services[i].title = v;
                      setLocalConfig({...localConfig, homePage: {...localConfig.homePage, services}});
                    }} />
                    <CMSArea label={`Service ${i+1} Description`} value={s.desc} onChange={v => {
                      const services = [...localConfig.homePage.services];
                      services[i].desc = v;
                      setLocalConfig({...localConfig, homePage: {...localConfig.homePage, services}});
                    }} />
                  </div>
                ))}
              </div>
            </CMSSection>
          )}

          {activeTab === 'Inventory' && (
            <CMSSection title="Inventory Page">
              <CMSField label="Page Header Title" value={localConfig.inventoryPage.title} onChange={v => setLocalConfig({...localConfig, inventoryPage: {...localConfig.inventoryPage, title: v}})} />
              <CMSArea label="Header Description" value={localConfig.inventoryPage.description} onChange={v => setLocalConfig({...localConfig, inventoryPage: {...localConfig.inventoryPage, description: v}})} />
            </CMSSection>
          )}

          {activeTab === 'About' && (
            <CMSSection title="About Page Content">
              <CMSArea label="Hero Introduction" value={localConfig.aboutPage.heroText} onChange={v => setLocalConfig({...localConfig, aboutPage: {...localConfig.aboutPage, heroText: v}})} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <CMSField label="Mission Title" value={localConfig.aboutPage.missionTitle} onChange={v => setLocalConfig({...localConfig, aboutPage: {...localConfig.aboutPage, missionTitle: v}})} />
                <CMSField label="Values Title" value={localConfig.aboutPage.valuesTitle} onChange={v => setLocalConfig({...localConfig, aboutPage: {...localConfig.aboutPage, valuesTitle: v}})} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <CMSArea label="Mission Statement" value={localConfig.aboutPage.missionText} onChange={v => setLocalConfig({...localConfig, aboutPage: {...localConfig.aboutPage, missionText: v}})} />
                <CMSArea label="Values Statement" value={localConfig.aboutPage.valuesText} onChange={v => setLocalConfig({...localConfig, aboutPage: {...localConfig.aboutPage, valuesText: v}})} />
              </div>
              <CMSField label="Heritage Image URL" value={localConfig.aboutPage.imageUrl} onChange={v => setLocalConfig({...localConfig, aboutPage: {...localConfig.aboutPage, imageUrl: v}})} />
            </CMSSection>
          )}

          {activeTab === 'FAQ' && (
            <CMSSection title="FAQ Management">
              {localConfig.faqPage.map((item, idx) => (
                <div key={idx} className="p-6 border border-white/5 rounded-3xl space-y-4">
                  <CMSField label={`Question ${idx + 1}`} value={item.q} onChange={v => {
                    const newList = [...localConfig.faqPage];
                    newList[idx].q = v;
                    setLocalConfig({...localConfig, faqPage: newList});
                  }} />
                  <CMSArea label={`Answer ${idx + 1}`} value={item.a} onChange={v => {
                    const newList = [...localConfig.faqPage];
                    newList[idx].a = v;
                    setLocalConfig({...localConfig, faqPage: newList});
                  }} />
                </div>
              ))}
            </CMSSection>
          )}

          {activeTab === 'Financing' && (
            <CMSSection title="Financing Solutions">
              <CMSArea label="Hero Statement" value={localConfig.financingPage.heroText} onChange={v => setLocalConfig({...localConfig, financingPage: {...localConfig.financingPage, heroText: v}})} />
              <div className="space-y-6">
                {localConfig.financingPage.cards.map((card, idx) => (
                  <div key={idx} className="p-6 border border-white/5 rounded-3xl space-y-4">
                    <CMSField label={`Solution Title ${idx + 1}`} value={card.title} onChange={v => {
                      const newCards = [...localConfig.financingPage.cards];
                      newCards[idx].title = v;
                      setLocalConfig({...localConfig, financingPage: {...localConfig.financingPage, cards: newCards}});
                    }} />
                    <CMSArea label={`Solution Description ${idx + 1}`} value={card.desc} onChange={v => {
                      const newCards = [...localConfig.financingPage.cards];
                      newCards[idx].desc = v;
                      setLocalConfig({...localConfig, financingPage: {...localConfig.financingPage, cards: newCards}});
                    }} />
                  </div>
                ))}
              </div>
            </CMSSection>
          )}

          {activeTab === 'Policies' && (
            <CMSSection title="Legal Framework">
              <CMSArea label="Privacy Policy Statement" value={localConfig.privacyPolicy} onChange={v => setLocalConfig({...localConfig, privacyPolicy: v})} />
              <CMSArea label="Terms of Service Agreement" value={localConfig.termsOfService} onChange={v => setLocalConfig({...localConfig, termsOfService: v})} />
            </CMSSection>
          )}
        </div>
      </div>
    </div>
  );
};

const CMSSection = ({ title, children }: any) => (
  <div className="glass p-10 rounded-[3rem] border-white/5 space-y-8 shadow-2xl">
    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 border-b border-white/5 pb-4">{title}</h3>
    <div className="space-y-6">
      {children}
    </div>
  </div>
);

const CMSField = ({ label, value, onChange }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4 font-bold">{label}</label>
    <input 
      className="w-full bg-zinc-900 border border-white/5 rounded-full px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 text-white transition-all hover:bg-zinc-800"
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

const CMSArea = ({ label, value, onChange }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4 font-bold">{label}</label>
    <textarea 
      className="w-full bg-zinc-900 border border-white/5 rounded-[1.5rem] px-8 py-8 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 text-white min-h-[150px] leading-relaxed transition-all hover:bg-zinc-800"
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

export default SiteCMS;
