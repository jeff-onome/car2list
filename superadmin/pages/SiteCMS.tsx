import React, { useState } from 'react';
import { useSiteConfig } from '../../context/SiteConfigContext';
import Swal from 'https://esm.sh/sweetalert2@11';
import { CurrencyConfig, Testimonial, CustomSection as CustomSectionType } from '../../types';
import { storageService } from '../../services/storage';

const SiteCMS: React.FC = () => {
  const { config, updateConfig } = useSiteConfig();
  const [localConfig, setLocalConfig] = useState(config);
  const [activeTab, setActiveTab] = useState('Global');
  const [isUploading, setIsUploading] = useState(false);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, path: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const url = await storageService.uploadImage(file);
      if (url) {
        // Deep clone and set by path
        const newConfig = JSON.parse(JSON.stringify(localConfig));
        const keys = path.split('.');
        let current = newConfig;
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = url;
        setLocalConfig(newConfig);
        Swal.fire({ 
          toast: true, 
          position: 'top-end', 
          icon: 'success', 
          title: 'Asset uploaded', 
          showConfirmButton: false, 
          timer: 1500,
          background: '#0a0a0a',
          color: '#fff'
        });
      }
      setIsUploading(false);
    }
  };

  const addTestimonial = () => {
    const newT: Testimonial = { 
      id: Date.now().toString(), 
      text: 'New Testimonial', 
      name: 'Anonymous Client', 
      role: 'Collector' 
    };
    setLocalConfig({ ...localConfig, testimonials: [...localConfig.testimonials, newT] });
  };

  const removeTestimonial = (id: string) => {
    setLocalConfig({ ...localConfig, testimonials: localConfig.testimonials.filter(t => t.id !== id) });
  };

  const tabs = [
    'Global', 
    'Currencies', 
    'Custom Sections', 
    'Testimonials', 
    'Home Page', 
    'Inventory', 
    'About', 
    'FAQ', 
    'Financing', 
    'Policies'
  ];

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
          <h1 className="text-4xl font-bold uppercase tracking-tighter text-white">Site CMS</h1>
          <button 
            onClick={handleSave}
            disabled={isUploading}
            className="bg-white text-black px-12 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all shadow-2xl disabled:opacity-50"
          >
            {isUploading ? 'Syncing Assets...' : 'Commit Global Changes'}
          </button>
        </div>

        <div className="flex overflow-x-auto gap-2 mb-8 no-scrollbar pb-2">
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

          {activeTab === 'Currencies' && (
            <CMSSection title="Currency Management">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4 font-bold">Active System Currency</label>
                    <select 
                      className="w-full bg-zinc-900 border border-white/5 rounded-full px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 text-white appearance-none"
                      value={localConfig.activeCurrency}
                      onChange={e => setLocalConfig({...localConfig, activeCurrency: e.target.value})}
                    >
                      {Object.keys(localConfig.currencies).map(code => (
                        <option key={code} value={code}>{code} ({localConfig.currencies[code].symbol})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                  {Object.values(localConfig.currencies).map((currValue: any) => {
                    const curr = currValue as CurrencyConfig;
                    return (
                      <div key={curr.code} className="p-4 border border-white/5 rounded-2xl bg-zinc-900/50 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white tracking-tighter">{curr.code}</span>
                          <span className="text-zinc-500 text-xs font-mono">{curr.symbol}</span>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] uppercase tracking-widest text-zinc-600 font-bold ml-1">Exchange Rate (1 USD = )</label>
                          <input 
                            type="number" 
                            step="0.01"
                            className="w-full bg-zinc-950 border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                            value={curr.rate}
                            onChange={e => {
                              const newCurrencies = { ...localConfig.currencies };
                              newCurrencies[curr.code] = { ...curr, rate: Number(e.target.value) };
                              setLocalConfig({...localConfig, currencies: newCurrencies});
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CMSSection>
          )}

          {activeTab === 'Custom Sections' && (
            <CMSSection title="Custom Home Page Sections">
              <div className="space-y-12">
                {['section1', 'section2', 'section3'].map((sKey: string) => {
                  const sec = localConfig.customSections[sKey as keyof typeof localConfig.customSections];
                  return (
                    <div key={sKey} className="p-8 border border-white/5 rounded-[2.5rem] bg-zinc-950 space-y-6">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-white">Custom Segment {sKey.slice(-1)}</h4>
                        <button 
                          onClick={() => {
                            const newSec = { ...sec, isActive: !sec.isActive };
                            setLocalConfig({ ...localConfig, customSections: { ...localConfig.customSections, [sKey]: newSec } });
                          }}
                          className={`px-6 py-2 rounded-full text-[8px] font-bold uppercase tracking-widest border transition-all ${sec.isActive ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-zinc-800 text-zinc-500 border-white/5'}`}
                        >
                          {sec.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <CMSField label="Segment Title" value={sec.title} onChange={v => {
                            const newS = { ...sec, title: v };
                            setLocalConfig({ ...localConfig, customSections: { ...localConfig.customSections, [sKey]: newS } });
                          }} />
                          <CMSField label="Segment Subtitle" value={sec.subtitle} onChange={v => {
                            const newS = { ...sec, subtitle: v };
                            setLocalConfig({ ...localConfig, customSections: { ...localConfig.customSections, [sKey]: newS } });
                          }} />
                          <CMSArea label="Segment Narrative" value={sec.content} onChange={v => {
                            const newS = { ...sec, content: v };
                            setLocalConfig({ ...localConfig, customSections: { ...localConfig.customSections, [sKey]: newS } });
                          }} />
                          <div className="space-y-2">
                             <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4 font-bold">Image Alignment</label>
                             <select 
                               className="w-full bg-zinc-900 border border-white/5 rounded-full px-6 py-4 text-sm text-white appearance-none"
                               value={sec.layout}
                               onChange={e => {
                                 const newS = { ...sec, layout: e.target.value as any };
                                 setLocalConfig({ ...localConfig, customSections: { ...localConfig.customSections, [sKey]: newS } });
                               }}
                             >
                               <option value="left">Text Left / Image Right</option>
                               <option value="right">Image Left / Text Right</option>
                             </select>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="aspect-video rounded-3xl overflow-hidden glass relative">
                            <img src={sec.imageUrl} className="w-full h-full object-cover opacity-50" alt="" />
                            <label className="absolute inset-0 flex items-center justify-center cursor-pointer group hover:bg-black/40 transition-all">
                               <span className="bg-white text-black px-6 py-3 rounded-full font-bold text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Replace Asset</span>
                               <input type="file" className="hidden" onChange={e => handleImageUpload(e, `customSections.${sKey}.imageUrl`)} />
                            </label>
                          </div>
                          <CMSField label="Or Image URL" value={sec.imageUrl} onChange={v => {
                            const newS = { ...sec, imageUrl: v };
                            setLocalConfig({ ...localConfig, customSections: { ...localConfig.customSections, [sKey]: newS } });
                          }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CMSSection>
          )}

          {activeTab === 'Testimonials' && (
            <CMSSection title="Collector Testimonials">
              <div className="space-y-6">
                 {localConfig.testimonials.map((t, idx) => (
                   <div key={t.id} className="p-6 border border-white/5 rounded-3xl bg-zinc-950 space-y-4 relative group">
                      <button 
                        onClick={() => removeTestimonial(t.id)}
                        className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                      >
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <CMSArea label="Quote" value={t.text} onChange={v => {
                            const list = [...localConfig.testimonials];
                            list[idx].text = v;
                            setLocalConfig({ ...localConfig, testimonials: list });
                         }} />
                         <div className="space-y-4">
                            <CMSField label="Author Name" value={t.name} onChange={v => {
                               const list = [...localConfig.testimonials];
                               list[idx].name = v;
                               setLocalConfig({ ...localConfig, testimonials: list });
                            }} />
                            <CMSField label="Author Role" value={t.role} onChange={v => {
                               const list = [...localConfig.testimonials];
                               list[idx].role = v;
                               setLocalConfig({ ...localConfig, testimonials: list });
                            }} />
                            <div className="flex gap-4 items-end">
                              <CMSField label="Avatar URL" value={t.avatar || ''} onChange={v => {
                                 const list = [...localConfig.testimonials];
                                 list[idx].avatar = v;
                                 setLocalConfig({ ...localConfig, testimonials: list });
                              }} />
                              <label className="mb-2 shrink-0 cursor-pointer">
                                <span className="bg-white/5 border border-white/10 text-white p-3 rounded-full hover:bg-white/10 transition-all inline-block">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                </span>
                                <input type="file" className="hidden" onChange={e => handleImageUpload(e, `testimonials.${idx}.avatar`)} />
                              </label>
                            </div>
                         </div>
                      </div>
                   </div>
                 ))}
                 <button 
                  onClick={addTestimonial}
                  className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-[10px] uppercase font-bold tracking-widest text-zinc-500 hover:border-white/20 hover:text-white transition-all"
                 >
                   + Add New Voice
                 </button>
              </div>
            </CMSSection>
          )}

          {activeTab === 'Home Page' && (
            <CMSSection title="Home Page Core">
              <CMSField label="Heritage Section Title" value={localConfig.homePage.heritageTitle} onChange={v => setLocalConfig({...localConfig, homePage: {...localConfig.homePage, heritageTitle: v}})} />
              <CMSArea label="Heritage Narrative" value={localConfig.homePage.heritageText} onChange={v => setLocalConfig({...localConfig, homePage: {...localConfig.homePage, heritageText: v}})} />
              <CMSField label="Services Section Title" value={localConfig.homePage.servicesTitle} onChange={v => setLocalConfig({...localConfig, homePage: {...localConfig.homePage, servicesTitle: v}})} />
              <div className="space-y-6 pt-4">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-4">Service Offerings</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {localConfig.homePage.services.map((s, i) => (
                    <div key={i} className="p-6 border border-white/5 rounded-3xl bg-zinc-950 space-y-4">
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
              </div>
            </CMSSection>
          )}

          {activeTab === 'Inventory' && (
            <CMSSection title="Inventory Interface">
              <CMSField label="Page Header Title" value={localConfig.inventoryPage.title} onChange={v => setLocalConfig({...localConfig, inventoryPage: {...localConfig.inventoryPage, title: v}})} />
              <CMSArea label="Header Description" value={localConfig.inventoryPage.description} onChange={v => setLocalConfig({...localConfig, inventoryPage: {...localConfig.inventoryPage, description: v}})} />
            </CMSSection>
          )}

          {activeTab === 'About' && (
            <CMSSection title="About Legacy">
              <CMSArea label="Hero Introduction" value={localConfig.aboutPage.heroText} onChange={v => setLocalConfig({...localConfig, aboutPage: {...localConfig.aboutPage, heroText: v}})} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <CMSField label="Mission Title" value={localConfig.aboutPage.missionTitle} onChange={v => setLocalConfig({...localConfig, aboutPage: {...localConfig.aboutPage, missionTitle: v}})} />
                <CMSField label="Values Title" value={localConfig.aboutPage.valuesTitle} onChange={v => setLocalConfig({...localConfig, aboutPage: {...localConfig.aboutPage, valuesTitle: v}})} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <CMSArea label="Mission Statement" value={localConfig.aboutPage.missionText} onChange={v => setLocalConfig({...localConfig, aboutPage: {...localConfig.aboutPage, missionText: v}})} />
                <CMSArea label="Values Statement" value={localConfig.aboutPage.valuesText} onChange={v => setLocalConfig({...localConfig, aboutPage: {...localConfig.aboutPage, valuesText: v}})} />
              </div>
              <div className="space-y-4">
                <div className="aspect-video rounded-3xl overflow-hidden glass relative max-w-lg">
                   <img src={localConfig.aboutPage.imageUrl} className="w-full h-full object-cover opacity-50" alt="" />
                   <label className="absolute inset-0 flex items-center justify-center cursor-pointer group hover:bg-black/40 transition-all">
                      <span className="bg-white text-black px-6 py-3 rounded-full font-bold text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Upload Showroom Image</span>
                      <input type="file" className="hidden" onChange={e => handleImageUpload(e, 'aboutPage.imageUrl')} />
                   </label>
                </div>
                <CMSField label="Heritage Image URL" value={localConfig.aboutPage.imageUrl} onChange={v => setLocalConfig({...localConfig, aboutPage: {...localConfig.aboutPage, imageUrl: v}})} />
              </div>
            </CMSSection>
          )}

          {activeTab === 'FAQ' && (
            <CMSSection title="Knowledge Base">
              <div className="space-y-6">
                {localConfig.faqPage.map((item, idx) => (
                  <div key={idx} className="p-6 border border-white/5 rounded-3xl bg-zinc-950 space-y-4">
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
              </div>
            </CMSSection>
          )}

          {activeTab === 'Financing' && (
            <CMSSection title="Capital Management">
              <CMSArea label="Hero Statement" value={localConfig.financingPage.heroText} onChange={v => setLocalConfig({...localConfig, financingPage: {...localConfig.financingPage, heroText: v}})} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {localConfig.financingPage.cards.map((card, idx) => (
                  <div key={idx} className="p-6 border border-white/5 rounded-3xl bg-zinc-950 space-y-4">
                    <CMSField label={`Title ${idx + 1}`} value={card.title} onChange={v => {
                      const newCards = [...localConfig.financingPage.cards];
                      newCards[idx].title = v;
                      setLocalConfig({...localConfig, financingPage: {...localConfig.financingPage, cards: newCards}});
                    }} />
                    <CMSArea label={`Description ${idx + 1}`} value={card.desc} onChange={v => {
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
  <div className="glass p-10 rounded-[3rem] border-white/5 space-y-8 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 border-b border-white/5 pb-4">{title}</h3>
    <div className="space-y-6">
      {children}
    </div>
  </div>
);

const CMSField = ({ label, value, onChange, type = "text" }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4 font-bold">{label}</label>
    <input 
      type={type}
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