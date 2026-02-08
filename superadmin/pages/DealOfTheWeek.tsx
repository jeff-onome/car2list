
import React, { useState, useEffect } from 'react';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { useCars } from '../../context/CarContext';
import { dbService } from '../../services/database';
import Swal from 'https://esm.sh/sweetalert2@11';
import { storageService } from '../../services/storage';

const DealOfTheWeekAdmin: React.FC = () => {
  const { config, updateConfig, formatPrice } = useSiteConfig();
  const { cars } = useCars();
  const [deal, setDeal] = useState(config.dealOfTheWeek);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(deal.image);

  // Sync state if config updates from DB
  useEffect(() => {
    setDeal(config.dealOfTheWeek);
    setImagePreview(config.dealOfTheWeek.image);
  }, [config.dealOfTheWeek]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      const url = await storageService.uploadImage(file);
      if (url) {
        setDeal(prev => ({ ...prev, image: url }));
        setImagePreview(url);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Asset uploaded',
          showConfirmButton: false,
          timer: 2000,
          background: '#0a0a0a',
          color: '#fff'
        });
      } else {
        Swal.fire('Upload Error', 'Failed to store image.', 'error');
      }
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      let finalCarId = deal.carId;

      // Prepare Car Data object
      const carData = {
        make: deal.make,
        model: deal.model,
        year: Number(deal.year) || 2024,
        price: Number(deal.price),
        type: deal.type || 'Luxury',
        transmission: deal.transmission || 'Automatic',
        fuel: deal.fuel || 'Petrol',
        mileage: Number(deal.mileage) || 0,
        hp: Number(deal.hp) || 0,
        acceleration: deal.acceleration || '0s',
        description: deal.description,
        images: [deal.image],
        features: ['Concierge Delivery', 'Sphere Standard Inspected', 'Featured Deal'],
        isFeatured: true,
        dealerId: 'admin',
        dealerName: 'Platform Official',
        categories: deal.categories || ['Limited Edition'],
        status: 'approved' as const
      };

      // Check if carId exists and is in current cars list
      const existingCar = cars.find(c => c.id === deal.carId);

      if (existingCar) {
        // Update existing car
        await dbService.updateCar(deal.carId, carData);
      } else {
        // Create new car entry
        const newId = await dbService.addCar(carData);
        if (newId) finalCarId = newId;
      }

      // Finalize Config Update
      const finalDeal = { ...deal, carId: finalCarId };
      await updateConfig({ dealOfTheWeek: finalDeal });

      Swal.fire({
        title: 'Promotion Synchronized',
        text: 'The Deal of the Week and its corresponding inventory entry have been updated.',
        icon: 'success',
        confirmButtonColor: '#000',
        background: '#111',
        color: '#fff'
      });
    } catch (err) {
      console.error(err);
      Swal.fire('System Error', 'Failed to synchronize with the registry.', 'error');
    }
  };

  const availableCategories = ['New', 'Pre-Owned', 'Rental', 'Limited Edition', 'Auction'];

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter text-white">Deal Manager</h1>
            <p className="text-zinc-500 text-sm mt-1">Updates both the spotlight promotion and the main showroom inventory.</p>
          </div>
          <div className="flex items-center gap-4 glass px-6 py-4 rounded-full border-white/10">
            <span className={`text-[9px] uppercase font-bold tracking-tighter ${deal.isActive ? 'text-white' : 'text-zinc-600'}`}>
              {deal.isActive ? 'Visible' : 'Hidden'}
            </span>
            <button 
              onClick={() => setDeal({...deal, isActive: !deal.isActive})}
              className={`w-12 h-6 rounded-full transition-colors relative ${deal.isActive ? 'bg-white' : 'bg-zinc-800'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${deal.isActive ? 'right-1 bg-black' : 'left-1 bg-zinc-500'}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-white/5 pb-4">Core Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Manufacturer" value={deal.make} onChange={v => setDeal({...deal, make: v})} />
                <Field label="Model" value={deal.model} onChange={v => setDeal({...deal, model: v})} />
                <Field label="Year" type="number" value={deal.year} onChange={v => setDeal({...deal, year: v})} />
                <Field label="Valuation (USD)" type="number" value={deal.price} onChange={v => setDeal({...deal, price: v})} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4 font-bold">Body Type</label>
                  <select className="w-full bg-zinc-900 border border-white/5 rounded-full px-6 py-4 text-sm text-white appearance-none" value={deal.type} onChange={e => setDeal({...deal, type: e.target.value})}>
                    <option value="Luxury">Luxury</option><option value="Sports">Sports</option><option value="SUV">SUV</option><option value="Classic">Classic</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4 font-bold">Transmission</label>
                  <select className="w-full bg-zinc-900 border border-white/5 rounded-full px-6 py-4 text-sm text-white appearance-none" value={deal.transmission} onChange={e => setDeal({...deal, transmission: e.target.value})}>
                    <option value="Automatic">Automatic</option><option value="Manual">Manual</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4 font-bold">Fuel Source</label>
                  <select className="w-full bg-zinc-900 border border-white/5 rounded-full px-6 py-4 text-sm text-white appearance-none" value={deal.fuel} onChange={e => setDeal({...deal, fuel: e.target.value})}>
                    <option value="Petrol">Petrol</option><option value="Electric">Electric</option><option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Field label="Mileage (MI)" type="number" value={deal.mileage} onChange={v => setDeal({...deal, mileage: v})} />
                <Field label="Power (HP)" type="number" value={deal.hp} onChange={v => setDeal({...deal, hp: v})} />
                <Field label="0-100 km/h" value={deal.acceleration} onChange={v => setDeal({...deal, acceleration: v})} />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4 font-bold">Classifications</label>
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setDeal(prev => ({...prev, categories: prev.categories?.includes(cat) ? prev.categories.filter(c => c !== cat) : [...(prev.categories || []), cat]}))}
                      className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all ${deal.categories?.includes(cat) ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-600 border-white/5'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass p-8 rounded-[2.5rem] border-white/5 space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-white/5 pb-4">Narrative Description</h3>
              <textarea 
                className="w-full bg-zinc-900 border border-white/5 rounded-[2rem] px-8 py-8 text-sm text-white min-h-[150px] leading-relaxed focus:outline-none focus:ring-1 focus:ring-white/10"
                value={deal.description}
                onChange={e => setDeal({...deal, description: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-8">
            <div className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-white/5 pb-4">Promotion Meta</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4 font-bold">Expiration Date</label>
                  <input 
                    type="datetime-local"
                    className="w-full bg-zinc-900 border border-white/5 rounded-full px-6 py-4 text-sm text-white"
                    value={deal.endTime?.slice(0, 16)}
                    onChange={e => setDeal({...deal, endTime: new Date(e.target.value).toISOString()})}
                  />
                </div>
                <Field label="Registry Car ID (Read-only)" value={deal.carId || 'Unlinked'} readOnly />
              </div>
            </div>

            <div className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-white/5 pb-4">Hero Imagery</h3>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900 relative border border-white/5">
                {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" alt="" /> : <div className="flex items-center justify-center h-full text-zinc-700 text-[9px] uppercase font-bold tracking-widest">No Asset</div>}
                {isUploading && <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center text-[10px] text-white font-bold uppercase animate-pulse">Syncing...</div>}
                <label className="absolute inset-0 cursor-pointer flex items-center justify-center opacity-0 hover:opacity-100 hover:bg-black/40 transition-all">
                  <span className="bg-white text-black px-6 py-2 rounded-full font-bold text-[8px] uppercase tracking-widest">Replace Asset</span>
                  <input type="file" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                </label>
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={isUploading}
              className="w-full bg-white text-black py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all shadow-xl active:scale-[0.98]"
            >
              Update Deal & Inventory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, type = "text", readOnly = false }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4 font-bold">{label}</label>
    <input 
      type={type}
      readOnly={readOnly}
      className={`w-full bg-zinc-900 border border-white/5 rounded-full px-6 py-4 text-sm text-white ${readOnly ? 'opacity-40 cursor-not-allowed' : 'hover:bg-zinc-800'}`}
      value={value}
      onChange={e => !readOnly && onChange(e.target.value)}
    />
  </div>
);

export default DealOfTheWeekAdmin;
