
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
              <CMSArea label="Hero Subtitle" value={localConfig.heroSubtitle} onChange={v => setLocalConfig({...localConfig, heroSubtitle: v})} />
              <CMSField label="Featured Banner Text" value={localConfig.featuredBanner} onChange={v => setLocalConfig({...localConfig, featuredBanner: v})} />
              <div className="pt-6 border-t border-white/5">
                <CMSArea 
                  label="Live Chat Integration Script" 
                  value={localConfig.liveChatScript || ''} 
                  onChange={v => setLocalConfig({...localConfig, liveChatScript: v})} 
                  placeholder="Paste your raw integration code here (e.g. <script src='...' async></script>)"
                />
              </div>
            </CMSSection>
          )}

          {activeTab === 'SEO Engine' && (
            <CMSSection title="Search Index Optimization">
              <CMSField label="Meta Title" value={localConfig.seo.metaTitle} onChange={v => setLocalConfig({...localConfig, seo: {...localConfig.seo, metaTitle: v}})} />
              <CMSArea label="Meta Description" value={localConfig.seo.metaDescription} onChange={v => setLocalConfig({...localConfig, seo: {...localConfig.seo, metaDescription: v}})} />
              <CMSField label="Semantic Keywords (Comma separated)" value={localConfig.seo.keywords} onChange={v => setLocalConfig({...localConfig, seo: {...localConfig.seo, keywords: v}})} />
              <div className="space-y-4 pt-4 border-t border-white/5">
                 <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4 font-bold">Social Sharing Image (OG:Image)</label>
                 <div className="aspect-video rounded-3xl overflow-hidden glass relative max-w-lg">
                    <img src={localConfig.seo.ogImage} className="w-full h-full object-cover opacity-50" alt="" />
                    <label className="absolute inset-0 flex items-center justify-center cursor-pointer group hover:bg-black/40 transition-all">
                       <span className="bg-white text-black px-6 py-3 rounded-full font-bold text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Replace SEO Asset</span>
                       <input type="file" className="hidden" onChange={e => handleImageUpload(e, 'seo.ogImage')} />
                    </label>
                 </div>
                 <CMSField label="Direct Image URL" value={localConfig.seo.ogImage} onChange={v => setLocalConfig({...localConfig, seo: {...localConfig.seo, ogImage: v}})} />
              </div>
            </CMSSection>
          )}

          {activeTab === 'Social Assets' && (
            <CMSSection title="Social Media Connectors">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {['facebook', 'twitter', 'instagram', 'whatsapp'].map(platform => (
                    <CMSField 
                      key={platform}
                      label={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`} 
                      value={localConfig.socialLinks[platform] || ''} 
                      onChange={v => {
                        const newLinks = { ...localConfig.socialLinks, [platform]: v };
                        setLocalConfig({ ...localConfig, socialLinks: newLinks });
                      }} 
                    />
                  ))}
               </div>
            </CMSSection>
          )}

          {activeTab === 'Home Page' && (
            <CMSSection title="Landing Layout">
              <CMSField label="Heritage Section Title" value={localConfig.homePage.heritageTitle} onChange={v => setLocalConfig({...localConfig, homePage: {...localConfig.homePage, heritageTitle: v}})} />
              <CMSArea label="Heritage Narrative" value={localConfig.homePage.heritageText} onChange={v => setLocalConfig({...localConfig, homePage: {...localConfig.homePage, heritageText: v}})} />
              <CMSField label="Services Segment Title" value={localConfig.homePage.servicesTitle} onChange={v => setLocalConfig({...localConfig, homePage: {...localConfig.homePage, servicesTitle: v}})} />
              <div className="space-y-6 pt-4">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-4">Concierge Offerings</label>
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

          {activeTab === 'About' && (
            <CMSSection title="Heritage Narrative">
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
                      <span className="bg-white text-black px-6 py-3 rounded-full font-bold text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Upload Asset</span>
                      <input type="file" className="hidden" onChange={e => handleImageUpload(e, 'aboutPage.imageUrl')} />
                    </label>
                </div>
              </div>
            </CMSSection>
          )}

          {activeTab === 'FAQ' && (
            <CMSSection title="Global Knowledge Base">
              <div className="space-y-6">
                {localConfig.faqPage.map((item, idx) => (
                  <div key={idx} className="p-6 border border-white/5 rounded-3xl bg-zinc-950 space-y-4 relative group">
                    <button onClick={() => removeFAQ(idx)} className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition-all">×</button>
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
                <button onClick={addFAQ} className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-[10px] uppercase font-bold text-zinc-500 hover:text-white transition-all">+ Add Item</button>
              </div>
            </CMSSection>
          )}

          {activeTab === 'Financing' && (
            <CMSSection title="Capital Management">
              <CMSArea label="Hero Statement" value={localConfig.financingPage.heroText} onChange={v => setLocalConfig({...localConfig, financingPage: {...localConfig.financingPage, heroText: v}})} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {localConfig.financingPage.cards.map((card, idx) => (
                  <div key={idx} className="p-6 border border-white/5 rounded-3xl bg-zinc-950 space-y-4">
                    <CMSField label={`Solution ${idx + 1} Title`} value={card.title} onChange={v => {
                      const newCards = [...localConfig.financingPage.cards];
                      newCards[idx].title = v;
                      setLocalConfig({...localConfig, financingPage: {...localConfig.financingPage, cards: newCards}});
                    }} />
                    <CMSArea label={`Solution ${idx + 1} Narrative`} value={card.desc} onChange={v => {
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
            <CMSSection title="Registry Interface">
              <CMSField label="Showroom Header Title" value={localConfig.inventoryPage.title} onChange={v => setLocalConfig({...localConfig, inventoryPage: {...localConfig.inventoryPage, title: v}})} />
              <CMSArea label="Showroom Narrative" value={localConfig.inventoryPage.description} onChange={v => setLocalConfig({...localConfig, inventoryPage: {...localConfig.inventoryPage, description: v}})} />
            </CMSSection>
          )}

          {activeTab === 'Policies' && (
            <CMSSection title="Compliance Framework">
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
    <div className="space-y-6">{children}</div>
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

const CMSArea = ({ label, value, onChange, placeholder }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4 font-bold">{label}</label>
    <textarea 
      className="w-full bg-zinc-900 border border-white/5 rounded-[1.5rem] px-8 py-8 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 text-white min-h-[150px] leading-relaxed transition-all hover:bg-zinc-800"
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

export default SiteCMS;
