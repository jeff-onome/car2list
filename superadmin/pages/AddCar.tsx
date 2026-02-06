
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'https://esm.sh/sweetalert2@11';
import { useCars } from '../../context/CarContext';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storage';
import { dbService } from '../../services/database';

const AddCar: React.FC = () => {
  const navigate = useNavigate();
  const { addCar } = useCars();
  const { user } = useAuth();
  const [images, setImages] = useState<{file?: File, preview: string}[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    categories: ['New'],
    type: 'Luxury' as const,
    description: '',
    fuel: 'Petrol' as const,
    transmission: 'Automatic' as const,
    hp: '',
    acceleration: '',
    mileage: ''
  });

  const availableCategories = ['New', 'Pre-Owned', 'Rental', 'Limited Edition', 'Auction'];

  const toggleCategory = (cat: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => setImages(prev => [...prev, { file, preview: reader.result as string }]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => setImages(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      Swal.fire({ title: 'Images Required', text: 'Upload at least one asset.', icon: 'warning', background: '#111', color: '#fff' });
      return;
    }

    if (formData.categories.length === 0) {
      Swal.fire({ title: 'Classification Required', text: 'Select at least one vehicle category.', icon: 'warning', background: '#111', color: '#fff' });
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadPromises = images.map(async (img) => img.file ? await storageService.uploadImage(img.file) : null);
      const uploadedUrls = (await Promise.all(uploadPromises)).filter(url => url !== null) as string[];

      const carData = {
        ...formData,
        price: Number(formData.price),
        hp: Number(formData.hp) || 0,
        mileage: Number(formData.mileage) || 0,
        images: uploadedUrls,
        features: ['Concierge Delivery', 'Sphere Standard Inspected', 'Admin Verified'],
        isFeatured: false,
        dealerId: user?.id || 'admin',
        dealerName: 'AutoSphere Official',
        status: 'approved' as const // Admin uploads bypass moderation
      };

      const resultId = await addCar(carData as any);
      if (resultId) {
        Swal.fire({ title: 'Masterpiece Enrolled', text: 'Listing is now live in the global showroom.', icon: 'success', background: '#111', color: '#fff' }).then(() => navigate('/admin/dashboard'));
      }
    } catch (error) {
      Swal.fire({ title: 'System Error', icon: 'error', background: '#111', color: '#fff' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold uppercase tracking-tighter mb-12">Admin Entry</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="glass p-10 rounded-[3rem] space-y-8 border-white/5 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField label="Manufacturer" value={formData.make} onChange={(v:string) => setFormData({...formData, make:v})} required />
                <FormField label="Model" value={formData.model} onChange={(v:string) => setFormData({...formData, model:v})} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FormField label="Year" type="number" value={formData.year} onChange={(v:string) => setFormData({...formData, year: Number(v)})} />
                <FormField label="Price ($)" type="number" value={formData.price} onChange={(v:string) => setFormData({...formData, price: v})} required />
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4 font-bold">Body Type</label>
                  <select className="w-full bg-zinc-900 border border-white/5 rounded-full px-6 py-4 text-sm text-white appearance-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                    <option value="Luxury">Luxury</option><option value="Sports">Sports</option><option value="SUV">SUV</option><option value="Classic">Classic</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField label="Power (HP)" type="number" value={formData.hp} onChange={(v:string) => setFormData({...formData, hp: v})} required />
                <FormField label="0-100 km/h (s)" placeholder="e.g. 3.2s" value={formData.acceleration} onChange={(v:string) => setFormData({...formData, acceleration: v})} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4 font-bold">Fuel Type</label>
                  <select className="w-full bg-zinc-900 border border-white/5 rounded-full px-6 py-4 text-sm text-white appearance-none" value={formData.fuel} onChange={e => setFormData({...formData, fuel: e.target.value as any})}>
                    <option value="Petrol">Petrol</option><option value="Electric">Electric</option><option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <FormField label="Mileage (MI)" type="number" value={formData.mileage} onChange={(v:string) => setFormData({...formData, mileage: v})} required />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4 font-bold">Market Classifications (Multi-select)</label>
                <div className="flex flex-wrap gap-3 p-2">
                  {availableCategories.map(cat => {
                    const isSelected = formData.categories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all duration-300 ${isSelected ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-zinc-900 text-zinc-500 border-white/5 hover:border-white/20'}`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <textarea className="w-full bg-zinc-900 border border-white/5 rounded-[2rem] px-8 py-8 text-sm text-white min-h-[200px]" placeholder="Administrative notes and vehicle details..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
            </div>
          </div>
          <div className="space-y-8">
            <div className="glass p-10 rounded-[3rem] border-white/5 shadow-2xl">
              <label className="block w-full cursor-pointer group">
                <div className="border-2 border-dashed border-white/10 rounded-2xl p-10 text-center hover:bg-white/5 transition-all">
                  <span className="text-[10px] uppercase font-bold text-zinc-500">Select Asset Gallery</span>
                  <input type="file" multiple className="hidden" onChange={handleImageUpload} />
                </div>
              </label>
              <div className="grid grid-cols-3 gap-3 mt-6">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img src={img.preview} className="w-full h-full object-cover" alt="" />
                    <button type="button" onClick={() => removeImage(idx)} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-500 font-bold">×</button>
                  </div>
                ))}
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-white text-black py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all shadow-xl disabled:opacity-50">
              {isSubmitting ? 'Syncing...' : 'Enroll Masterpiece'}
            </button>
            <p className="text-[9px] text-center text-zinc-600 uppercase tracking-widest">Admin uploads are automatically approved.</p>
          </div>
        </form>
      </div>
    </div>
  );
};

const FormField = ({ label, type = "text", value, onChange, ...props }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4 font-bold">{label}</label>
    <input type={type} className="w-full bg-zinc-900 border border-white/5 rounded-full px-6 py-4 text-sm text-white transition-all hover:bg-zinc-800" value={value} onChange={e => onChange(e.target.value)} {...props} />
  </div>
);

export default AddCar;
