
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'https://esm.sh/sweetalert2@11';
import { useCars } from '../../context/CarContext';
import { useAuth } from '../../context/AuthContext';

const AddCar: React.FC = () => {
  const navigate = useNavigate();
  const { addCar } = useCars();
  const { user } = useAuth();
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    listingType: 'New' as const,
    type: 'Luxury' as const,
    description: '',
    fuel: 'Petrol' as const,
    transmission: 'Automatic' as const,
    hp: 500,
    acceleration: '3.5s',
    mileage: 0
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      Swal.fire({
        title: 'Images Required',
        text: 'Please upload at least one high-resolution image of the vehicle.',
        icon: 'warning',
        confirmButtonColor: '#000',
        background: '#111',
        color: '#fff'
      });
      return;
    }

    setIsSubmitting(true);

    const carData = {
      ...formData,
      price: Number(formData.price),
      images: images,
      features: ['Concierge Delivery', 'Sphere Standard Inspected'],
      isFeatured: false,
      dealerId: user?.id || 'unknown',
      dealerName: user?.name || 'Authorized Dealer'
    };

    const resultId = await addCar(carData);
    setIsSubmitting(false);

    if (resultId) {
      Swal.fire({
        title: 'Success!',
        text: 'Your masterpiece has been synchronized with the global inventory.',
        icon: 'success',
        confirmButtonColor: '#000',
        background: '#111',
        color: '#fff'
      }).then(() => navigate('/dealer/dashboard'));
    } else {
      Swal.fire({
        title: 'Deployment Failed',
        text: 'An error occurred during synchronization. Please check your connection.',
        icon: 'error',
        confirmButtonColor: '#000',
        background: '#111',
        color: '#fff'
      });
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold uppercase tracking-tighter">System Entry</h1>
          <p className="text-zinc-500">Documenting a new masterpiece for the AutoSphere collection.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: General Details */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass p-10 rounded-[3rem] space-y-8 border-white/5 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField label="Manufacturer" value={formData.make} onChange={(v:string) => setFormData({...formData, make:v})} required />
                <FormField label="Model Designation" value={formData.model} onChange={(v:string) => setFormData({...formData, model:v})} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FormField label="Release Year" type="number" value={formData.year} onChange={(v:string) => setFormData({...formData, year: Number(v)})} />
                <FormField label="Market Valuation ($)" type="number" value={formData.price} onChange={(v:string) => setFormData({...formData, price: v})} required />
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4 font-bold">Category</label>
                  <select 
                    className="w-full bg-zinc-900 border border-white/5 rounded-full px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 text-white appearance-none"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                  >
                    <option value="Luxury">Luxury Sedan</option>
                    <option value="Sports">Supercar</option>
                    <option value="SUV">Ultra SUV</option>
                    <option value="Classic">Classic Heritage</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4 font-bold">Narrative Description</label>
                <textarea 
                  className="w-full bg-zinc-900 border border-white/5 rounded-[2rem] px-8 py-8 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 text-white min-h-[250px] leading-relaxed"
                  placeholder="Detail the provenance and unique characteristics of this vehicle..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>

          {/* Right: Media & Submission */}
          <div className="space-y-8">
            <div className="glass p-10 rounded-[3rem] border-white/5 shadow-2xl">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-white/5 pb-4 mb-6">Visual Documentation</h3>
              
              <div className="space-y-4">
                <label className="block w-full cursor-pointer group">
                  <div className="border-2 border-dashed border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center group-hover:bg-white/5 transition-all group-hover:border-white/20">
                    <svg className="w-10 h-10 text-zinc-600 mb-4 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 group-hover:text-white transition-colors">Select Images</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </div>
                </label>

                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                        <img src={img} className="w-full h-full object-cover" alt="" />
                        <button 
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-black/60 backdrop-blur-md rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="glass p-10 rounded-[3rem] border-white/5 shadow-2xl space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-zinc-500">
                  <span>Exposure Tier</span>
                  <span className="text-white">Global Premium</span>
                </div>
                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-zinc-500">
                  <span>Sync Status</span>
                  <span className="text-white">Cloud Ready</span>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full bg-white text-black py-5 rounded-full font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-xl text-xs flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting && <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                {isSubmitting ? 'Synchronizing...' : 'Submit Listing'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const FormField = ({ label, type = "text", value, onChange, ...props }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4 font-bold">{label}</label>
    <input 
      type={type}
      className="w-full bg-zinc-900 border border-white/5 rounded-full px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 text-white transition-all hover:bg-zinc-800"
      value={value}
      onChange={e => onChange(e.target.value)}
      {...props}
    />
  </div>
);

export default AddCar;
