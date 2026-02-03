
import React, { useState } from 'react';
import { useSiteConfig } from '../../context/SiteConfigContext';
import Swal from 'https://esm.sh/sweetalert2@11';
import { storageService } from '../../services/storage';

const DealOfTheWeekAdmin: React.FC = () => {
  const { config, updateConfig } = useSiteConfig();
  const [deal, setDeal] = useState(config.dealOfTheWeek);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(deal.image);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // Show local preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase
      const url = await storageService.uploadImage(file);
      if (url) {
        setDeal(prev => ({ ...prev, image: url }));
        setImagePreview(url);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Asset uploaded to Supabase',
          showConfirmButton: false,
          timer: 2000,
          background: '#0a0a0a',
          color: '#fff'
        });
      } else {
        Swal.fire('Upload Error', 'Failed to store image in Supabase.', 'error');
      }
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    updateConfig({ dealOfTheWeek: deal });
    Swal.fire({
      title: 'Promotion Updated',
      text: 'The Deal of the Week has been successfully updated on the landing page.',
      icon: 'success',
      confirmButtonColor: '#000',
      background: '#111',
      color: '#fff'
    });
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter">Promotional Manager</h1>
            <p className="text-zinc-500 text-sm mt-1">Configure the spotlight "Deal of the Week" featured on the home page.</p>
          </div>
          <div className="flex items-center justify-between md:justify-start gap-4 glass px-6 py-4 rounded-3xl md:rounded-full border-white/10 w-full md:w-auto">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Promotion Visibility</span>
            <div className="flex items-center gap-3">
              <span className={`text-[9px] uppercase font-bold tracking-tighter ${deal.isActive ? 'text-white' : 'text-zinc-600'}`}>
                {deal.isActive ? 'Live' : 'Hidden'}
              </span>
              <button 
                onClick={() => setDeal({...deal, isActive: !deal.isActive})}
                className={`w-12 h-6 rounded-full transition-colors relative ${deal.isActive ? 'bg-white' : 'bg-zinc-800'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${deal.isActive ? 'right-1 bg-black' : 'left-1 bg-zinc-500'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <div className="space-y-6 md:space-y-8">
            <div className="glass p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border-white/5 space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-white/5 pb-4">Core Metadata</h3>
              <div className="space-y-4">
                <Field label="Manufacturer" value={deal.make} onChange={v => setDeal({...deal, make: v})} />
                <Field label="Model Designation" value={deal.model} onChange={v => setDeal({...deal, model: v})} />
                <Field label="Special Price ($)" type="number" value={deal.price.toString()} onChange={v => setDeal({...deal, price: Number(v)})} />
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4 font-bold">Expiration (End Time)</label>
                  <input 
                    type="datetime-local"
                    className="w-full bg-zinc-900 border border-white/5 rounded-full px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 text-white"
                    value={deal.endTime.slice(0, 16)}
                    onChange={e => setDeal({...deal, endTime: new Date(e.target.value).toISOString()})}
                  />
                </div>
              </div>
            </div>

            <div className="glass p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border-white/5 space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-white/5 pb-4">Promotional Narrative</h3>
              <textarea 
                className="w-full bg-zinc-900 border border-white/5 rounded-[1.5rem] md:rounded-[2rem] px-6 py-6 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 text-white min-h-[150px] leading-relaxed"
                placeholder="Hook the buyer with a compelling description..."
                value={deal.description}
                onChange={e => setDeal({...deal, description: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-6 md:space-y-8">
            <div className="glass p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border-white/5 space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-white/5 pb-4">Visual Asset</h3>
              <div className="space-y-6">
                <div className="aspect-[16/10] rounded-2xl overflow-hidden border border-white/5 bg-zinc-900 relative">
                  {imagePreview ? (
                    <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700 uppercase tracking-widest text-[10px]">No image selected</div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                       <span className="text-[10px] text-white uppercase font-bold tracking-widest animate-pulse">Uploading to Supabase...</span>
                    </div>
                  )}
                </div>
                <label className="block w-full cursor-pointer">
                  <div className="w-full bg-zinc-900 border border-white/5 rounded-full px-6 py-4 text-center text-[10px] uppercase font-bold tracking-widest hover:bg-zinc-800 transition-colors">
                    Upload Cinematic Asset
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                </label>
              </div>
            </div>

            <div className="glass p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border-white/5 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-zinc-500">
                  <span>Deployment Scope</span>
                  <span className="text-white">Global Landing</span>
                </div>
                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-zinc-500">
                  <span>Storage Backend</span>
                  <span className="text-emerald-400 font-bold uppercase tracking-tighter">Supabase</span>
                </div>
              </div>
              <div className="pt-2">
                <button 
                  onClick={handleSave}
                  disabled={isUploading}
                  className="w-full bg-white text-black py-5 rounded-full font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-xl text-xs active:scale-[0.98]"
                >
                  Launch Promotion
                </button>
                <p className="text-[9px] text-zinc-600 uppercase text-center tracking-tighter mt-4">Immediate global synchronization upon submission.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, type = "text" }: any) => (
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

export default DealOfTheWeekAdmin;
