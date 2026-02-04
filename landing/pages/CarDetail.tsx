
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCars } from '../../context/CarContext';
import { useUserData } from '../../context/UserDataContext';
import { useSiteConfig } from '../../context/SiteConfigContext';
import SEO from '../../components/SEO';

const CarDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getCarById, favorites, toggleFavorite } = useCars();
  const { addRecentlyViewed } = useUserData();
  const { formatPrice } = useSiteConfig();
  
  const car = getCarById(id || '');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (id) addRecentlyViewed(id);
    window.scrollTo(0, 0);
  }, [id]);

  if (!car) {
    return <div className="min-h-screen flex items-center justify-center text-white">Car not found.</div>;
  }

  const isFav = favorites.includes(car.id);
  const images = car.images && car.images.length > 0 ? car.images : ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200'];

  const carSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `${car.make} ${car.model}`,
    "image": images,
    "description": car.description,
    "brand": {
      "@type": "Brand",
      "name": car.make
    },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "USD",
      "price": car.price,
      "availability": "https://schema.org/InStock",
      "itemCondition": (car.categories || []).includes('New') ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition"
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <SEO 
        title={`${car.year} ${car.make} ${car.model} for Sale`} 
        description={`Explore the stunning ${car.make} ${car.model}. ${car.description.substring(0, 150)}...`} 
        schema={carSchema}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left: Dynamic Image Gallery */}
        <div className="relative bg-zinc-900 lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] flex flex-col">
          <div className="flex-grow relative overflow-hidden group">
            <img 
              src={images[activeImageIndex]} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              alt={`${car.make} ${car.model} main view`}
            />
            
            {/* Gallery Navigation Controls */}
            {images.length > 1 && (
              <>
                <button 
                  onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button 
                  onClick={() => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
              </>
            )}

            <div className="absolute top-4 left-4 md:top-8 md:left-8 flex flex-col gap-4">
              <Link to="/inventory" className="glass px-4 py-2 rounded-full text-[9px] md:text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 transition-all w-fit backdrop-blur-xl">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Inventory
              </Link>
            </div>
            
            {/* Image Indicator */}
            <div className="absolute bottom-6 left-6 glass px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-tighter backdrop-blur-xl border-white/5">
              {activeImageIndex + 1} / {images.length}
            </div>
          </div>

          {/* Thumbnails Strip */}
          {images.length > 1 && (
            <div className="p-4 bg-black/40 backdrop-blur-md border-t border-white/5 overflow-x-auto no-scrollbar flex gap-3">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative shrink-0 w-24 aspect-video rounded-lg overflow-hidden border-2 transition-all ${activeImageIndex === idx ? 'border-white' : 'border-transparent opacity-50 hover:opacity-100'}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt={`Thumbnail ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="p-6 md:p-12 lg:p-16 space-y-8 md:space-y-12 bg-black relative z-10">
          <main className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <span className="text-zinc-500 uppercase tracking-widest text-[9px] md:text-xs">{car.year} Release</span>
                {(car.categories || []).map(cat => (
                  <span key={cat} className="bg-white/10 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest text-white border border-white/5">{cat}</span>
                ))}
              </div>
              <button 
                onClick={() => toggleFavorite(car.id)}
                className={`p-2.5 md:p-3 rounded-full border transition-all ${isFav ? 'bg-white text-black border-white' : 'border-white/10 text-white hover:bg-white/5'}`}
                aria-label="Toggle Favorite"
              >
                <svg className="w-5 h-5" fill={isFav ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </button>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tighter leading-none">{car.make} {car.model}</h1>
            <p className="text-2xl md:text-3xl font-light text-zinc-300">{formatPrice(car.price)}</p>
          </main>

          <article className="text-zinc-400 leading-relaxed text-base md:text-lg max-w-xl">
            <h2 className="sr-only">Vehicle Description</h2>
            {car.description}
          </article>

          <section className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/10">
            <SpecItem label="Power" value={`${car.hp} HP`} />
            <SpecItem label="0-100 km/h" value={car.acceleration} />
            <SpecItem label="Fuel Type" value={car.fuel} />
            <SpecItem label="Mileage" value={`${car.mileage.toLocaleString()} mi`} />
          </section>

          <section className="space-y-6">
            <h3 className="text-lg md:text-xl font-bold uppercase tracking-widest">Key Features</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {car.features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-zinc-400 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </section>

          <div className="pt-8 md:pt-12 flex flex-col sm:flex-row gap-4">
            <button className="flex-grow bg-white text-black py-4 rounded-full font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all text-[10px] md:text-xs shadow-xl">
              Inquire Now
            </button>
            <button className="flex-grow border border-white/20 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-white/5 transition-all text-[10px] md:text-xs">
              Book Test Drive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SpecItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <h4 className="text-[9px] md:text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-bold">{label}</h4>
    <p className="text-sm md:text-lg font-bold truncate">{value}</p>
  </div>
);

export default CarDetail;
