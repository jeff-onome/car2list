import React, { useState } from 'react';
import { useSiteConfig } from '../../context/SiteConfigContext';
import Swal from 'https://esm.sh/sweetalert2@11';
import { CurrencyConfig, Testimonial, CustomSection as CustomSectionType, FAQItem } from '../../types';
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
      text: 'Site configuration updated successfully across all instances. Market prices have been re-calibrated.',
      icon: 'success',
      confirmButtonColor: '#000',
      background: '#111',
      color: '#fff',
      customClass: {
        popup: 'glass rounded-[2rem] border border-white/10 shadow-2xl'
      }
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, path: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const url = await storageService.uploadImage(file);
      if (url) {
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

  const addFAQ = () => {
    const newItem: FAQItem = { q: 'New Question', a: 'Detailed Answer' };
    setLocalConfig({ ...localConfig, faqPage: [...localConfig.faqPage, newItem] });
  };

  const removeFAQ = (idx: number) => {
    setLocalConfig({ ...localConfig, faqPage: localConfig.faqPage.filter((_, i) => i !== idx) });
  };

  const tabs = [
    'Global', 
    'SEO Engine',
    'Currencies', 
    'Social Assets',
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
          <div>
             <h1 className="text-4xl font-bold uppercase tracking-tighter text-white">System CMS</h1>
             <p className="text-zinc-500 uppercase text-[10px] tracking-widest font-bold mt-2">Real-time Platform Governance</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={isUploading}
            className="bg-white text-black px-12 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all shadow-2xl disabled:opacity-50"
          >
            {isUploading ? 'Syncing Assets...' : 'Commit Global Changes'}
          </button>
        </div>

        <div className="flex overflow-x-auto gap-2 mb-12 no-scrollbar pb-2">
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
        
        <div className="space-y-12">
          {activeTab === 'Global' && (
            <CMSSection title="Global Identity">
              <CMSField label="Site Name" value={localConfig.siteName} onChange={(v:string) => setLocalConfig({...localConfig, siteName: v})} />
              <CMSField label="Hero Title" value={localConfig.heroTitle} onChange={(v:string) => setLocalConfig({...localConfig, heroTitle: v})} />
              <CMSArea label="Hero Subtitle" value={localConfig.heroSubtitle} onChange={(v:string) => setLocalConfig({...localConfig, heroSubtitle: v})} />
              <CMSField label="Featured Banner Text" value={localConfig.featuredBanner} onChange={(v:string) => setLocalConfig({...localConfig, featuredBanner: v})} />
              <div className="pt-6 border-t border-white/5">
                <CMSArea 
                  label="Live Chat Integration Script" 
                  value={localConfig.liveChatScript || ''} 
                  onChange={(v:string) => setLocalConfig({...localConfig, liveChatScript: v})} 
                  placeholder="Paste your raw integration code here (e.g. <script src='...' async></script>)"
                />
              </div>
            </CMSSection>
          )}

          {activeTab === 'Currencies' && (
            <CMSSection title="Global Market Currencies">
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Fixed: Explicitly cast Object.values to CurrencyConfig[] to resolve 'unknown' type errors */}
                  {(Object.values(localConfig.currencies) as CurrencyConfig[]).map((curr) => (
                    <div key={curr.code} className={`p-8 rounded-[2.5rem] border transition-all duration-500 ${localConfig.activeCurrency === curr.code ? 'bg-white/5 border-white/20 ring-1 ring-white/10' : 'border-white/5 bg-zinc-950'}`}>
                      <div className="flex justify-between items-start mb-6">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg border ${localConfig.activeCurrency === curr.code ? 'bg-white text-black border-white' : 'bg-white/5 text-zinc-500 border-white/5'}`}>
                          {curr.symbol}
                        </div>
                        {localConfig.activeCurrency === curr.code ? (
                          <span className="text-[8px] bg-emerald-500 text-black px-3 py-1 rounded-full font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.3)]">Active Market</span>
                        ) : (
                          <button 
                            onClick={() => setLocalConfig({ ...localConfig, activeCurrency: curr.code })}
                            className="text-[8px] text-zinc-500 hover:text-white uppercase font-bold tracking-widest transition-colors border border-white/5 px-3 py-1 rounded-full hover:bg-white/5"
                          >
                            Set Primary
                          </button>
                        )}
                      </div>
                      <div className="space-y-5">
                        <CMSField label="ISO Code" value={curr.code} readOnly />
                        <CMSField label="Market Symbol" value={curr.symbol} onChange={(v: string) => {
                          const newCurrs = { ...localConfig.currencies };
                          newCurrs[curr.code] = { ...curr, symbol: v };
                          setLocalConfig({ ...localConfig, currencies: newCurrs });
                        }} />
                        <CMSField label="Exchange Rate (1 USD = ?)" type="number" value={curr.rate} onChange={(v: string) => {
                          const newCurrs = { ...localConfig.currencies };
                          newCurrs[curr.code] = { ...curr, rate: parseFloat(v) || 0 };
                          setLocalConfig({ ...localConfig, currencies: newCurrs });
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-8 glass rounded-[2rem] border-amber-500/20 bg-amber-500/[0.02]">
                  <div className="flex gap-4">
                     <div className="text-amber-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     </div>
                     <p className="text-[10px] text-zinc-400 leading-relaxed uppercase tracking-widest font-bold">
                       Administrator Notice: Base valuations for all inventory are stored in USD. Adjusting exchange rates or switching the Active Market will immediately re-calculate all global listings, rental durations, and portfolio valuations in real-time.
                     </p>
                  </div>
                </div>
              </div>
            </CMSSection>
          )}

          {activeTab === 'Custom Sections' && (
            <CMSSection title="Additional Landing Segments">
              <div className="space-y-12">
                {/* Fixed: Explicitly cast Object.entries to [string, CustomSectionType][] to resolve 'unknown' type errors */}
                {(Object.entries(localConfig.customSections) as [string, CustomSectionType][]).map(([key, sec]) => (
                  <div key={key} className="p-10 border border-white/5 rounded-[3rem] bg-zinc-950 space-y-8 relative group shadow-xl">
                    <div className="flex justify-between items-center border-b border-white/5 pb-6">
                      <div className="flex items-center gap-6">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">{key}</span>
                        <div className="flex items-center gap-3">
                           <span className={`text-[9px] uppercase font-bold tracking-widest ${sec.isActive ? 'text-white' : 'text-zinc-700'}`}>{sec.isActive ? 'Live' : 'Off'}</span>
                           <button onClick={() => {
                             const newSections = { ...localConfig.customSections };
                             newSections[key].isActive = !sec.isActive;
                             setLocalConfig({ ...localConfig, customSections: newSections });
                           }} className={`w-12 h-6 rounded-full transition-colors relative ${sec.isActive ? 'bg-white' : 'bg-zinc-800'}`}>
                             <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${sec.isActive ? 'right-1 bg-black shadow-lg' : 'left-1 bg-zinc-600'}`} />
                           </button>
                        </div>
                      </div>
                      <button onClick={() => {
                        const newSections = { ...localConfig.customSections };
                        newSections[key].layout = sec.layout === 'left' ? 'right' : 'left';
                        setLocalConfig({ ...localConfig, customSections: newSections });
                      }} className="text-[10px] uppercase font-bold text-zinc-500 hover:text-white transition-all border border-white/10 px-6 py-2 rounded-full hover:bg-white/5">
                        Layout Orientation: <span className="text-white">{sec.layout}</span>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <CMSField label="Section Header" value={sec.title} onChange={(v:string) => {
                          const newSections = { ...localConfig.customSections };
                          newSections[key].title = v;
                          setLocalConfig({ ...localConfig, customSections: newSections });
                        }} />
                        <CMSField label="Accent Subtitle" value={sec.subtitle} onChange={(v:string) => {
                          const newSections = { ...localConfig.customSections };
                          newSections[key].subtitle = v;
                          setLocalConfig({ ...localConfig, customSections: newSections });
                        }} />
                        <CMSArea label="Narrative Payload" value={sec.content} onChange={(v:string) => {
                          const newSections = { ...localConfig.customSections };
                          newSections[key].content = v;
                          setLocalConfig({ ...localConfig, customSections: newSections });
                        }} />
                      </div>
                      <div className="space-y-6">
                         <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-4">Imagery Component</label>
                         <div className="aspect-video rounded-[2rem] overflow-hidden glass relative border border-white/5">
                            <img src={sec.imageUrl} className="w-full h-full object-cover opacity-60" alt="" />
                            <label className="absolute inset-0 flex items-center justify-center cursor-pointer group hover:bg-black/60 transition-all backdrop-blur-0 hover:backdrop-blur-sm">
                               <span className="bg-white text-black px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all shadow-2xl">Upload Asset</span>
                               <input type="file" className="hidden" onChange={e => handleImageUpload(e, `customSections.${key}.imageUrl`)} />
                            </label>
                         </div>
                         <CMSField label="Fallback Image URL" value={sec.imageUrl} onChange={(v:string) => {
                           const newSections = { ...localConfig.customSections };
                           newSections[key].imageUrl = v;
                           setLocalConfig({ ...localConfig, customSections: newSections });
                         }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CMSSection>
          )}

          {activeTab === 'Testimonials' && (
            <CMSSection title="Collector Endorsement Registry">
              <div className="space-y-8">
                {localConfig.testimonials.map((t, idx) => (
                  <div key={t.id} className="p-10 border border-white/5 rounded-[3rem] bg-zinc-950 space-y-8 relative group shadow-xl">
                    <button onClick={() => removeTestimonial(t.id)} className="absolute top-8 right-8 text-red-500/30 hover:text-red-500 transition-all uppercase text-[9px] font-bold tracking-widest border border-red-500/10 px-4 py-1.5 rounded-full hover:bg-red-500/10">Purge Record</button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                       <div className="space-y-6">
                          <CMSField label="Member Identity" value={t.name} onChange={(v:string) => {
                            const ts = [...localConfig.testimonials];
                            ts[idx].name = v;
                            setLocalConfig({...localConfig, testimonials: ts});
                          }} />
                          <CMSField label="Tier / Role" value={t.role} onChange={(v:string) => {
                            const ts = [...localConfig.testimonials];
                            ts[idx].role = v;
                            setLocalConfig({...localConfig, testimonials: ts});
                          }} />
                       </div>
                       <div className="space-y-6">
                          <CMSArea label="Feedback Manuscript" value={t.text} onChange={(v:string) => {
                            const ts = [...localConfig.testimonials];
                            ts[idx].text = v;
                            setLocalConfig({...localConfig, testimonials: ts});
                          }} />
                       </div>
                    </div>
                  </div>
                ))}
                <button onClick={addTestimonial} className="w-full py-10 border-2 border-dashed border-white/5 rounded-[3rem] text-[10px] uppercase font-bold text-zinc-600 hover:text-white hover:border-white/20 transition-all flex flex-col items-center gap-4 group">
                  <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  </div>
                  Enroll New Testimonial
                </button>
              </div>
            </CMSSection>
          )}

          {activeTab === 'SEO Engine' && (
            <CMSSection title="Search Index Optimization">
              <CMSField label="Meta Title" value={localConfig.seo.metaTitle} onChange={(v:string) => setLocalConfig({...localConfig, seo: {...localConfig.seo, metaTitle: v}})} />
              <CMSArea label="Meta Description" value={localConfig.seo.metaDescription} onChange={(v:string) => setLocalConfig({...localConfig, seo: {...localConfig.seo, metaDescription: v}})} />
              <CMSField label="Semantic Keywords (Comma separated)" value={localConfig.seo.keywords} onChange={(v:string) => setLocalConfig({...localConfig, seo: {...localConfig.seo, keywords: v}})} />
              <div className="space-y-6 pt-6 border-t border-white/5">
                 <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4 font-bold">Social Sharing Image (OG:Image)</label>
                 <div className="aspect-video rounded-[2rem] overflow-hidden glass relative max-w-2xl border border-white/5 shadow-2xl">
                    <img src={localConfig.seo.ogImage} className="w-full h-full object-cover opacity-60" alt="" />
                    <label className="absolute inset-0 flex items-center justify-center cursor-pointer group hover:bg-black/60 transition-all backdrop-blur-0 hover:backdrop-blur-sm">
                       <span className="bg-white text-black px-10 py-4 rounded-full font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all shadow-2xl">Sync SEO Asset</span>
                       <input type="file" className="hidden" onChange={e => handleImageUpload(e, 'seo.ogImage')} />
                    </label>
                 </div>
                 <CMSField label="Global Resource URL" value={localConfig.seo.ogImage} onChange={(v:string) => setLocalConfig({...localConfig, seo: {...localConfig.seo, ogImage: v}})} />
              </div>
            </CMSSection>
          )}

          {activeTab === 'Social Assets' && (
            <CMSSection title="Social Media Connectors">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {['facebook', 'twitter', 'instagram', 'whatsapp'].map(platform => (
                    <CMSField 
                      key={platform}
                      label={`${platform.charAt(0).toUpperCase() + platform.slice(1)} Identity Link`} 
                      value={localConfig.socialLinks[platform] || ''} 
                      onChange={(v:string) => {
                        const newLinks = { ...localConfig.socialLinks, [platform]: v };
                        setLocalConfig({ ...localConfig, socialLinks: newLinks });
                      }} 
                    />
                  ))}
               </div>
            </CMSSection>
          )}

          {activeTab === 'Home Page' && (
            <CMSSection title="Landing Architecture">
              <CMSField label="Legacy Segment Title" value={localConfig.homePage.heritageTitle} onChange={(v:string) => setLocalConfig({...localConfig, homePage: {...localConfig.homePage, heritageTitle: v}})} />
              <CMSArea label="Brand Narrative" value={localConfig.homePage.heritageText} onChange={(v:string) => setLocalConfig({...localConfig, homePage: {...localConfig.homePage, heritageText: v}})} />
              <CMSField label="Ecosystem Header" value={localConfig.homePage.servicesTitle} onChange={(v:string) => setLocalConfig({...localConfig, homePage: {...localConfig.homePage, servicesTitle: v}})} />
              <div className="space-y-8 pt-6 border-t border-white/5">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-4">Core Competencies</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {localConfig.homePage.services.map((s, i) => (
                    <div key={i} className="p-8 border border-white/5 rounded-[2.5rem] bg-zinc-950 space-y-6 shadow-lg">
                      <CMSField label={`Service ${i+1} Nomenclature`} value={s.title} onChange={(v:string) => {
                        const services = [...localConfig.homePage.services];
                        services[i].title = v;
                        setLocalConfig({...localConfig, homePage: {...localConfig.homePage, services}});
                      }} />
                      <CMSArea label={`Service ${i+1} Proposition`} value={s.desc} onChange={(v:string) => {
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

          {activeTab === 'About' && (
            <CMSSection title="Strategic Narrative">
              <CMSArea label="Executive Preface" value={localConfig.aboutPage.heroText} onChange={(v:string) => setLocalConfig({...localConfig, aboutPage: {...localConfig.aboutPage, heroText: v}})} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <CMSField label="Mission Descriptor" value={localConfig.aboutPage.missionTitle} onChange={(v:string) => setLocalConfig({...localConfig, aboutPage: {...localConfig.aboutPage, missionTitle: v}})} />
                <CMSField label="Values Descriptor" value={localConfig.aboutPage.valuesTitle} onChange={(v:string) => setLocalConfig({...localConfig, aboutPage: {...localConfig.aboutPage, valuesTitle: v}})} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <CMSArea label="Mission Statement" value={localConfig.aboutPage.missionText} onChange={(v:string) => setLocalConfig({...localConfig, aboutPage: {...localConfig.aboutPage, missionText: v}})} />
                <CMSArea label="Ethical Framework" value={localConfig.aboutPage.valuesText} onChange={(v:string) => setLocalConfig({...localConfig, aboutPage: {...localConfig.aboutPage, valuesText: v}})} />
              </div>
              <div className="space-y-6 pt-6 border-t border-white/5">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4 font-bold">Heritage Asset</label>
                <div className="aspect-[21/9] rounded-[2.5rem] overflow-hidden glass relative border border-white/5 shadow-2xl">
                   <img src={localConfig.aboutPage.imageUrl} className="w-full h-full object-cover opacity-60" alt="" />
                   <label className="absolute inset-0 flex items-center justify-center cursor-pointer group hover:bg-black/60 transition-all backdrop-blur-0 hover:backdrop-blur-sm">
                      <span className="bg-white text-black px-12 py-4 rounded-full font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all shadow-2xl">Upload Archive Image</span>
                      <input type="file" className="hidden" onChange={e => handleImageUpload(e, 'aboutPage.imageUrl')} />
                    </label>
                </div>
              </div>
            </CMSSection>
          )}

          {activeTab === 'FAQ' && (
            <CMSSection title="Global Knowledge Registry">
              <div className="space-y-8">
                {localConfig.faqPage.map((item, idx) => (
                  <div key={idx} className="p-10 border border-white/5 rounded-[3rem] bg-zinc-950 space-y-6 relative group shadow-xl">
                    <button onClick={() => removeFAQ(idx)} className="absolute top-8 right-8 text-red-500/40 hover:text-red-500 transition-all uppercase text-[9px] font-bold border border-red-500/10 px-4 py-1.5 rounded-full">Delete Node</button>
                    <CMSField label={`Consultation Query ${idx + 1}`} value={item.q} onChange={(v:string) => {
                      const newList = [...localConfig.faqPage];
                      newList[idx].q = v;
                      setLocalConfig({...localConfig, faqPage: newList});
                    }} />
                    <CMSArea label={`Expert Resolution ${idx + 1}`} value={item.a} onChange={(v:string) => {
                      const newList = [...localConfig.faqPage];
                      newList[idx].a = v;
                      setLocalConfig({...localConfig, faqPage: newList});
                    }} />
                  </div>
                ))}
                <button onClick={addFAQ} className="w-full py-10 border-2 border-dashed border-white/5 rounded-[3rem] text-[10px] uppercase font-bold text-zinc-600 hover:text-white transition-all flex flex-col items-center gap-3">+ Append Item</button>
              </div>
            </CMSSection>
          )}

          {activeTab === 'Financing' && (
            <CMSSection title="Capital Liquidity Management">
              <CMSArea label="Capital Statement" value={localConfig.financingPage.heroText} onChange={(v:string) => setLocalConfig({...localConfig, financingPage: {...localConfig.financingPage, heroText: v}})} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {localConfig.financingPage.cards.map((card, idx) => (
                  <div key={idx} className="p-8 border border-white/5 rounded-[2.5rem] bg-zinc-950 space-y-6 shadow-xl">
                    <CMSField label={`Solution ${idx + 1} Name`} value={card.title} onChange={(v:string) => {
                      const newCards = [...localConfig.financingPage.cards];
                      newCards[idx].title = v;
                      setLocalConfig({...localConfig, financingPage: {...localConfig.financingPage, cards: newCards}});
                    }} />
                    <CMSArea label={`Solution ${idx + 1} Brief`} value={card.desc} onChange={(v:string) => {
                      const newCards = [...localConfig.financingPage.cards];
                      newCards[idx].desc = v;
                      setLocalConfig({...localConfig, financingPage: {...localConfig.financingPage, cards: newCards}});
                    }} />
                  </div>
                ))}
              </div>
            </CMSSection>
          )}

          {activeTab === 'Inventory' && (
            <CMSSection title="Registry Showroom Interface">
              <CMSField label="Showroom Title" value={localConfig.inventoryPage.title} onChange={(v:string) => setLocalConfig({...localConfig, inventoryPage: {...localConfig.inventoryPage, title: v}})} />
              <CMSArea label="Registry Narrative" value={localConfig.inventoryPage.description} onChange={(v:string) => setLocalConfig({...localConfig, inventoryPage: {...localConfig.inventoryPage, description: v}})} />
            </CMSSection>
          )}

          {activeTab === 'Policies' && (
            <CMSSection title="Regulatory Framework">
              <CMSArea label="Privacy Governance Protocol" value={localConfig.privacyPolicy} onChange={(v:string) => setLocalConfig({...localConfig, privacyPolicy: v})} />
              <CMSArea label="Operational Terms of Service" value={localConfig.termsOfService} onChange={(v:string) => setLocalConfig({...localConfig, termsOfService: v})} />
            </CMSSection>
          )}
        </div>
      </div>
    </div>
  );
};

const CMSSection = ({ title, children }: any) => (
  <div className="glass p-12 rounded-[4rem] border-white/5 space-y-12 shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-700">
    <h3 className="text-sm font-bold uppercase tracking-[0.4em] text-zinc-500 border-b border-white/5 pb-8">{title}</h3>
    <div className="space-y-10">{children}</div>
  </div>
);

const CMSField = ({ label, value, onChange, type = "text", readOnly = false }: any) => (
  <div className="space-y-3">
    <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-6 font-bold">{label}</label>
    <input 
      type={type}
      readOnly={readOnly}
      className={`w-full bg-zinc-900 border border-white/5 rounded-full px-8 py-5 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 text-white transition-all ${readOnly ? 'opacity-40 cursor-not-allowed grayscale' : 'hover:bg-zinc-800'}`}
      value={value}
      onChange={e => !readOnly && onChange(e.target.value)}
    />
  </div>
);

const CMSArea = ({ label, value, onChange, placeholder }: any) => (
  <div className="space-y-3">
    <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-6 font-bold">{label}</label>
    <textarea 
      className="w-full bg-zinc-900 border border-white/5 rounded-[2.5rem] px-8 py-8 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 text-white min-h-[180px] leading-relaxed transition-all hover:bg-zinc-800"
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

export default SiteCMS;