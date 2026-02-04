
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCars } from '../../context/CarContext';
import { useUserData } from '../../context/UserDataContext';
import { useSiteConfig } from '../../context/SiteConfigContext';
import ThreeCarViewer from '../../components/ThreeCarViewer';
import SEO from '../../components/SEO';

const CarDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getCarById, favorites, toggleFavorite } = useCars();
  const { addRecentlyViewed } = useUserData();
  const { formatPrice } = useSiteConfig();

  const car = getCarById(id || '');

  useEffect(() => {
    if (id) addRecentlyViewed(id);
    window.scrollTo(0, 0);
  }, [id]);

  if (!car) {
    return <div className="min-h-screen flex items-center justify-center text-white">Car not found.</div>;
  }

  const isFav = favorites.includes(car.id);

  const carSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `${car.make} ${car.model}`,
    "image": car.images[0],
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
      "itemCondition": car.listingType === 'New' ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition"
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
        {/* Left: Visualization */}
        <div className="relative h-[40vh] md:h-[50vh] lg:h-[calc(100vh-64px)] bg-zinc-900 overflow-hidden lg:sticky lg:top-16">
          <ThreeCarViewer color="#ffffff" />
          <div className="absolute top-4 left-4 md:top-8 md:left-8">
            <Link to="/inventory" className="glass px-4 py-2 rounded-full text-[9px] md:text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Inventory
            </Link>
          </div>
        </div>

        {/* Right: Info */}
        <div className="p-6 md:p-12 lg:p-16 space-y-8 md:space-y-12">
          <main className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 uppercase tracking-widest text-[9px] md:text-xs">{car.year} Release</span>
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
            <button className="flex-grow bg-white text-black py-4 rounded-full font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all text-[10px] md:text-xs">
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
