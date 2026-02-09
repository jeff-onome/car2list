import React, { useState } from 'react';
import { useSiteConfig } from '../../context/SiteConfigContext';
import Swal from 'https://esm.sh/sweetalert2@11';
import { CurrencyConfig, Testimonial, CustomSection as CustomSectionType, FAQItem } from '../../types';
import { storageService } from '../../services/storage';
import { dbService } from '../../services/database';

const SiteCMS: React.FC = () => {
  const { config, updateConfig } = useSiteConfig();
  const [localConfig, setLocalConfig] = useState(config);
  const [activeTab, setActiveTab] = useState('Global');
  const [isUploading, setIsUploading] = useState(false);

  const handleSave = async () => {
    try {
      await updateConfig(localConfig);
      Swal.fire({
        title: 'Global Update',
        text: 'Site configuration updated successfully.',
        icon: 'success',
        confirmButtonColor: '#000',
        background: '#111',
        color: '#fff'
      });
    } catch (error) {
      Swal.fire('Error', 'Failed to synchronize configuration.', 'error');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, path: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
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
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Asset validated & uploaded', showConfirmButton: false, timer: 2000, background: '#111', color: '#fff' });
        }
      } catch (error: any) {
        Swal.fire('Security Alert', error.message || 'Secure upload failed.', 'error');
      }
      setIsUploading(false);
    }
  };

  const executeSystemClear = async (
    title: string, 
    warning: string, 
    confirmText: string, 
    action: () => Promise<void>
  ) => {
    const firstConfirm = await Swal.fire({
      title: `DANGER: ${title}`,
      text: warning,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'PROCEED TO VERIFICATION',
      confirmButtonColor: '#ef4444',
      background: '#0a0a0a',
      color: '#fff'
    });

    if (firstConfirm.isConfirmed) {
      const secondConfirm = await Swal.fire({
        title: 'FINAL VERIFICATION',
        text: `Type "${confirmText}" to execute the wipe.`,
        input: 'text',
        inputPlaceholder: confirmText,
        showCancelButton: true,
        confirmButtonText: 'EXECUTE PERMANENT WIPE',
        confirmButtonColor: '#ff0000',
        background: '#0a0a0a',
        color: '#fff',
        preConfirm: (value) => {
          if (value !== confirmText) {
            Swal.showValidationMessage('Verification text must match exactly.');
          }
          return value === confirmText;
        }
      });

      if (secondConfirm.isConfirmed) {
        try {
          await action();
          Swal.fire({ title: 'Success', text: 'Data has been purged.', icon: 'success', background: '#0a0a0a', color: '#fff' });
        } catch (error) {
          Swal.fire('Operation Failed', 'Database synchronization error.', 'error');
        }
      }
    }
  };

  const handleForceClearMonetary = () => executeSystemClear(
    'RESET MONETARY VALUES',
    'This will set ALL car prices, rental totals, and payment amounts to zero across the entire platform.',
    'CONFIRM MONETARY RESET',
    dbService.forceClearMonetaryValues
  );

  const handleClearRentals = () => executeSystemClear(
    'PURGE ALL RENTALS',
    'This will permanently delete every rental record in the system.',
    'CONFIRM RENTAL WIPE',
    dbService.clearAllRentals
  );

  const handleClearPayments = () => executeSystemClear(
    'PURGE ALL PAYMENTS',
    'This will permanently delete every payment transaction record in the system.',
    'CONFIRM PAYMENT WIPE',
    dbService.clearAllPayments
  );

  const handleClearCars = () => executeSystemClear(
    'PURGE CAR INVENTORY',
    'This will permanently delete all vehicle listings from the showroom.',
    'CONFIRM INVENTORY WIPE',
    dbService.clearAllCars
  );

  const handleClearIdentities = () => executeSystemClear(
    'PURGE IDENTITY REGISTRY',
    'This will permanently delete all user accounts and profile data.',
    'CONFIRM IDENTITY WIPE',
    dbService.clearAllIdentities
  );

  const tabs = [
    'Global', 'SEO Engine', 'Currencies', 'Social Assets', 'Custom Sections', 
    'Testimonials', 'Home Page', 'Inventory', 'About', 'FAQ', 'Financing', 'Policies', 'System Tools'
  ];

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
          <h1 className="text-4xl font-bold uppercase tracking-tighter text-white">System CMS</h1>
          <button onClick={handleSave} disabled={isUploading} className="bg-white text-black px-12 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all">
            Commit Changes
          </button>
        </div>

        <div className="flex overflow-x-auto gap-2 mb-12 no-scrollbar pb-2">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-3 rounded-full text-[10px] uppercase font-bold tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800'}`}>
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
              <CMSField label="Live Chat Integration Script" value={localConfig.liveChatScript || ''} onChange={(v:string) => setLocalConfig({...localConfig, liveChatScript: v})} />
            </CMSSection>
          )}

          {activeTab === 'SEO Engine' && (
            <CMSSection title="Search & Social Optimization">
              <CMSField label="Meta Title" value={localConfig.seo.metaTitle} onChange={(v:string) => setLocalConfig({...localConfig, seo: {...localConfig.seo, metaTitle: v}})} />
              <CMSArea label="Meta Description" value={localConfig.seo.metaDescription} onChange={(v:string) => setLocalConfig({...localConfig, seo: {...localConfig.seo, metaDescription: v}})} />
              <CMSArea label="Keywords (Comma separated)" value={localConfig.seo.keywords} onChange={(v:string) => setLocalConfig({...localConfig, seo: {...localConfig.seo, keywords: v}})} />
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-6 font-bold">OG Image Asset</label>
                <div className="aspect-[16/9] rounded-[2rem] overflow-hidden bg-zinc-900 relative group border border-white/5 max-w-md">
                   <img src={localConfig.seo.ogImage} className="w-full h-full object-cover" alt="SEO Preview" />
                   <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      <span className="bg-white text-black px-6 py-2 rounded-full font-bold text-[9px] uppercase tracking-widest">Replace Asset</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'seo.ogImage')} />
                   </label>
                </div>
              </div>
            </CMSSection>
          )}

          {activeTab === 'Currencies' && (
            <CMSSection title="Monetary Conversions">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-6 font-bold">Active Platform Currency</label>
                  <select 
                    className="w-full bg-zinc-900 border border-white/5 rounded-full px-8 py-5 text-sm text-white appearance-none"
                    value={localConfig.activeCurrency}
                    onChange={(e) => setLocalConfig({...localConfig, activeCurrency: e.target.value})}
                  >
                    {Object.keys(localConfig.currencies).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                  {Object.entries(localConfig.currencies).map(([code, currency]) => {
                    // Fix: Cast currency from Object.entries to CurrencyConfig to resolve 'unknown' type error
                    const curr = currency as CurrencyConfig;
                    return (
                      <div key={code} className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-4">
                        <p className="text-xs font-bold text-white uppercase tracking-widest">{code}</p>
                        <CMSField label="Symbol" value={curr.symbol} onChange={(v:string) => {
                          // Fix: Use functional state update to correctly update nested properties without direct mutation
                          setLocalConfig(prev => ({
                            ...prev,
                            currencies: {
                              ...prev.currencies,
                              [code]: { ...prev.currencies[code], symbol: v }
                            }
                          }));
                        }} />
                        <CMSField label="Rate (to USD)" value={curr.rate.toString()} onChange={(v:string) => {
                          // Fix: Use functional state update and ensure valid number conversion
                          setLocalConfig(prev => ({
                            ...prev,
                            currencies: {
                              ...prev.currencies,
                              [code]: { ...prev.currencies[code], rate: parseFloat(v) || 0 }
                            }
                          }));
                        }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </CMSSection>
          )}

          {activeTab === 'Social Assets' && (
            <CMSSection title="Global Link Registry">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {Object.keys(localConfig.socialLinks).map(key => (
                  <CMSField key={key} label={key.toUpperCase()} value={localConfig.socialLinks[key]} onChange={(v:string) => {
                    const updated = {...localConfig.socialLinks};
                    updated[key] = v;
                    setLocalConfig({...localConfig, socialLinks: updated});
                  }} />
                ))}
              </div>
            </CMSSection>
          )}

          {activeTab === 'Testimonials' && (
            <CMSSection title="Collector Feedback Registry">
              <div className="space-y-8">
                {localConfig.testimonials.map((t, idx) => (
                  <div key={t.id} className="p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[10px] font-bold uppercase text-white tracking-widest">Entry #{idx + 1}</h4>
                      <button onClick={() => {
                        const updated = localConfig.testimonials.filter((_, i) => i !== idx);
                        setLocalConfig({...localConfig, testimonials: updated});
                      }} className="text-red-500 text-[8px] font-bold uppercase tracking-widest hover:text-red-400">Purge Entry</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <CMSArea label="Feedback Payload" value={t.text} onChange={(v:string) => {
                        const updated = [...localConfig.testimonials];
                        updated[idx].text = v;
                        setLocalConfig({...localConfig, testimonials: updated});
                      }} />
                      <div className="space-y-4">
                        <CMSField label="Identity Name" value={t.name} onChange={(v:string) => {
                          const updated = [...localConfig.testimonials];
                          updated[idx].name = v;
                          setLocalConfig({...localConfig, testimonials: updated});
                        }} />
                        <CMSField label="Functional Role" value={t.role} onChange={(v:string) => {
                          const updated = [...localConfig.testimonials];
                          updated[idx].role = v;
                          setLocalConfig({...localConfig, testimonials: updated});
                        }} />
                        <div className="space-y-2">
                           <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-6 font-bold">Identity Avatar Asset</label>
                           <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-900 border border-white/5 relative group">
                              <img src={t.avatar || `https://i.pravatar.cc/150?u=${t.id}`} className="w-full h-full object-cover" alt="" />
                              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer">
                                 <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, `testimonials.${idx}.avatar`)} />
                                 <span className="text-[8px] text-white font-bold uppercase">Change</span>
                              </label>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => {
                  const newT: Testimonial = { id: `t_${Date.now()}`, text: 'Placeholder feedback...', name: 'New Client', role: 'Collector' };
                  setLocalConfig({...localConfig, testimonials: [...localConfig.testimonials, newT]});
                }} className="w-full py-4 border border-dashed border-white/10 rounded-full text-[10px] uppercase font-bold text-zinc-500 hover:border-white/40 hover:text-white transition-all">Enroll New Testimonial</button>
              </div>
            </CMSSection>
          )}

          {activeTab === 'Custom Sections' && (
            <CMSSection title="Custom Experience Layouts">
              <div className="space-y-12">
                {Object.keys(localConfig.customSections).map((key) => {
                  const sec = localConfig.customSections[key];
                  return (
                    <div key={key} className="space-y-6 p-8 bg-white/[0.02] rounded-[3rem] border border-white/5">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold uppercase tracking-widest text-white">{key}</h4>
                        <button onClick={() => {
                          const updated = { ...localConfig.customSections };
                          updated[key].isActive = !updated[key].isActive;
                          setLocalConfig({ ...localConfig, customSections: updated });
                        }} className={`px-6 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all ${sec.isActive ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-zinc-800 text-zinc-500 border-white/5'}`}>
                          {sec.isActive ? 'Section Active' : 'Hidden'}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-6">
                            <CMSField label="Spotlight Title" value={sec.title} onChange={(v:any) => {
                              const updated = { ...localConfig.customSections };
                              updated[key].title = v;
                              setLocalConfig({...localConfig, customSections: updated});
                            }} />
                            <CMSArea label="Narrative Content" value={sec.content} onChange={(v:any) => {
                              const updated = { ...localConfig.customSections };
                              updated[key].content = v;
                              setLocalConfig({...localConfig, customSections: updated});
                            }} />
                         </div>
                         <div className="space-y-4">
                            <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-6 font-bold">Secure Asset Control</label>
                            <div className="aspect-video rounded-[2rem] overflow-hidden bg-zinc-900 relative group border border-white/5">
                               <img src={sec.imageUrl} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all" alt="" />
                               <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                  <span className="bg-white text-black px-6 py-2 rounded-full font-bold text-[9px] uppercase tracking-widest">Replace with Secure Asset</span>
                                  <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleImageUpload(e, `customSections.${key}.imageUrl`)} />
                               </label>
                            </div>
                         </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CMSSection>
          )}

          {activeTab === 'Home Page' && (
            <CMSSection title="Hero & Showcase Controls">
              <CMSField label="Heritage Title" value={localConfig.homePage.heritageTitle} onChange={(v:string) => setLocalConfig({...localConfig, homePage: {...localConfig.homePage, heritageTitle: v}})} />
              <CMSArea label="Heritage Narrative" value={localConfig.homePage.heritageText} onChange={(v:string) => setLocalConfig({...localConfig, homePage: {...localConfig.homePage, heritageText: v}})} />
              <div className="space-y-8 pt-8">
                <CMSField label="Concierge Section Title" value={localConfig.homePage.servicesTitle} onChange={(v:string) => setLocalConfig({...localConfig, homePage: {...localConfig.homePage, servicesTitle: v}})} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {localConfig.homePage.services.map((s, idx) => (
                    <div key={idx} className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-4">
                      <CMSField label={`Service #${idx + 1} Label`} value={s.title} onChange={(v:string) => {
                        const updated = [...localConfig.homePage.services];
                        updated[idx].title = v;
                        setLocalConfig({...localConfig, homePage: {...localConfig.homePage, services: updated}});
                      }} />
                      <CMSArea label="Service Description" value={s.desc} onChange={(v:string) => {
                        const updated = [...localConfig.homePage.services];
                        updated[idx].desc = v;
                        setLocalConfig({...localConfig, homePage: {...localConfig.homePage, services: updated}});
                      }} />
                    </div>
                  ))}
                </div>
              </div>
            </CMSSection>
          )}

          {activeTab === 'Inventory' && (
            <CMSSection title="Global Showroom Metadata">
              <CMSField label="Display Title" value={localConfig.inventoryPage.title} onChange={(v:string) => setLocalConfig({...localConfig, inventoryPage: {...localConfig.inventoryPage, title: v}})} />
              <CMSArea label="Catalog Narrative" value={localConfig.inventoryPage.description} onChange={(v:string) => setLocalConfig({...localConfig, inventoryPage: {...localConfig.inventoryPage, description: v}})} />
            </CMSSection>
          )}

          {activeTab === 'About' && (
            <CMSSection title="Brand Narrative Dossier">
              <CMSArea label="Hero Introduction" value={localConfig.aboutPage.heroText} onChange={(v:string) => setLocalConfig({...localConfig, aboutPage: {...localConfig.aboutPage, heroText: v}})} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <CMSField label="Mission Designation" value={localConfig.aboutPage.missionTitle} onChange={(v:string) => setLocalConfig({...localConfig, aboutPage: {...localConfig.aboutPage, missionTitle: v}})} />
                  <CMSArea label="Mission Protocol" value={localConfig.aboutPage.missionText} onChange={(v:string) => setLocalConfig({...localConfig, aboutPage: {...localConfig.aboutPage, missionText: v}})} />
                </div>
                <div className="space-y-6">
                  <CMSField label="Core Values Label" value={localConfig.aboutPage.valuesTitle} onChange={(v:string) => setLocalConfig({...localConfig, aboutPage: {...localConfig.aboutPage, valuesTitle: v}})} />
                  <CMSArea label="Principles Protocol" value={localConfig.aboutPage.valuesText} onChange={(v:string) => setLocalConfig({...localConfig, aboutPage: {...localConfig.aboutPage, valuesText: v}})} />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-6 font-bold">Hero Atmosphere Asset</label>
                <div className="aspect-[21/9] rounded-[3rem] overflow-hidden bg-zinc-900 relative group border border-white/5">
                   <img src={localConfig.aboutPage.imageUrl} className="w-full h-full object-cover" alt="" />
                   <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      <span className="bg-white text-black px-6 py-2 rounded-full font-bold text-[9px] uppercase tracking-widest">Replace Atmosphere Asset</span>
                      <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'aboutPage.imageUrl')} />
                   </label>
                </div>
              </div>
            </CMSSection>
          )}

          {activeTab === 'FAQ' && (
            <CMSSection title="Knowledge Base Registry">
              <div className="space-y-6">
                {localConfig.faqPage.map((item, idx) => (
                  <div key={idx} className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest">Question Segment #{idx + 1}</h4>
                      <button onClick={() => {
                        const updated = localConfig.faqPage.filter((_, i) => i !== idx);
                        setLocalConfig({...localConfig, faqPage: updated});
                      }} className="text-red-500 text-[8px] font-bold uppercase hover:text-red-400">Purge</button>
                    </div>
                    <CMSField label="Collector Inquiry" value={item.q} onChange={(v:string) => {
                      const updated = [...localConfig.faqPage];
                      updated[idx].q = v;
                      setLocalConfig({...localConfig, faqPage: updated});
                    }} />
                    <CMSArea label="Concierge Response" value={item.a} onChange={(v:string) => {
                      const updated = [...localConfig.faqPage];
                      updated[idx].a = v;
                      setLocalConfig({...localConfig, faqPage: updated});
                    }} />
                  </div>
                ))}
                <button onClick={() => setLocalConfig({...localConfig, faqPage: [...localConfig.faqPage, { q: 'New Question?', a: 'Answer...' }]})} className="w-full py-4 border border-dashed border-white/10 rounded-full text-[10px] uppercase font-bold text-zinc-500 hover:text-white transition-all">Append Knowledge Segment</button>
              </div>
            </CMSSection>
          )}

          {activeTab === 'Financing' && (
            <CMSSection title="Capital & Liquidity Solutions">
              <CMSArea label="Financing Narrative" value={localConfig.financingPage.heroText} onChange={(v:string) => setLocalConfig({...localConfig, financingPage: {...localConfig.financingPage, heroText: v}})} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                {localConfig.financingPage.cards.map((card, idx) => (
                  <div key={idx} className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-4">
                    <CMSField label="Product Designation" value={card.title} onChange={(v:string) => {
                      const updated = [...localConfig.financingPage.cards];
                      updated[idx].title = v;
                      setLocalConfig({...localConfig, financingPage: {...localConfig.financingPage, cards: updated}});
                    }} />
                    <CMSArea label="Solution Protocol" value={card.desc} onChange={(v:string) => {
                      const updated = [...localConfig.financingPage.cards];
                      updated[idx].desc = v;
                      setLocalConfig({...localConfig, financingPage: {...localConfig.financingPage, cards: updated}});
                    }} />
                  </div>
                ))}
              </div>
            </CMSSection>
          )}

          {activeTab === 'Policies' && (
            <CMSSection title="Legal & Compliance Framework">
              <CMSArea label="Privacy Governance Protocol" value={localConfig.privacyPolicy} onChange={(v:string) => setLocalConfig({...localConfig, privacyPolicy: v})} />
              <CMSArea label="Membership Terms of Service" value={localConfig.termsOfService} onChange={(v:string) => setLocalConfig({...localConfig, termsOfService: v})} />
            </CMSSection>
          )}

          {activeTab === 'System Tools' && (
            <CMSSection title="System Maintenance & Integrity">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ToolCard title="Monetary Values" desc="Reset all prices and amounts across the site to 0." onAction={handleForceClearMonetary} />
                <ToolCard title="Rental Records" desc="Delete all history of rented vehicles and reservations." onAction={handleClearRentals} />
                <ToolCard title="Payment Registry" desc="Purge all verified and pending transaction records." onAction={handleClearPayments} />
                <ToolCard title="Cars Inventory" desc="Wipe the entire collection of masterpieces from the registry." onAction={handleClearCars} />
                <ToolCard title="Identity Records" desc="Permanently remove all member profiles and user data." onAction={handleClearIdentities} />
              </div>
            </CMSSection>
          )}
        </div>
      </div>
    </div>
  );
};

const ToolCard = ({ title, desc, onAction }: any) => (
  <div className="glass p-8 rounded-[2.5rem] border-red-500/10 bg-red-500/[0.01] flex flex-col justify-between gap-6 hover:bg-red-500/[0.03] transition-all">
    <div>
      <h4 className="text-lg font-bold uppercase tracking-tight text-red-500 mb-2">{title}</h4>
      <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-relaxed">{desc}</p>
    </div>
    <button onClick={onAction} className="bg-red-500 text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-[9px] hover:bg-red-600 transition-all shadow-lg self-start">
      Execute Wipe
    </button>
  </div>
);

const CMSSection = ({ title, children }: any) => (
  <div className="glass p-12 rounded-[4rem] border-white/5 space-y-12">
    <h3 className="text-sm font-bold uppercase tracking-[0.4em] text-zinc-500 border-b border-white/5 pb-8">{title}</h3>
    <div className="space-y-10">{children}</div>
  </div>
);

const CMSField = ({ label, value, onChange }: any) => (
  <div className="space-y-3">
    <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-6 font-bold">{label}</label>
    <input className="w-full bg-zinc-900 border border-white/5 rounded-full px-8 py-5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all hover:bg-zinc-800" value={value} onChange={e => onChange(e.target.value)} />
  </div>
);

const CMSArea = ({ label, value, onChange }: any) => (
  <div className="space-y-3">
    <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-6 font-bold">{label}</label>
    <textarea className="w-full bg-zinc-900 border border-white/5 rounded-[2.5rem] px-8 py-8 text-sm text-white min-h-[150px] focus:outline-none focus:ring-1 focus:ring-white/20 transition-all hover:bg-zinc-800 no-scrollbar" value={value} onChange={e => onChange(e.target.value)} />
  </div>
);

export default SiteCMS;