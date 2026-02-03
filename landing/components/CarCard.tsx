
import React from 'react';
import { Link } from 'react-router-dom';
import { Car } from '../../types';
import { useSiteConfig } from '../../context/SiteConfigContext';

interface CarCardProps {
  car: Car;
}

const CarCard: React.FC<CarCardProps> = ({ car }) => {
  const { formatPrice } = useSiteConfig();

  const getListingTypeLabel = () => {
    switch (car.listingType) {
      case 'New': return 'Buy New';
      case 'Used': return 'Buy Old';
      case 'Rent': return 'Rental';
      default: return car.listingType;
    }
  };

  const getListingTypeColor = () => {
    switch (car.listingType) {
      case 'New': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Used': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Rent': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-white/10 text-white border-white/20';
    }
  };

  return (
    <Link to={`/car/${car.id}`} className="group block glass rounded-2xl overflow-hidden hover:border-white/30 transition-all duration-500">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
          src={car.images[0]} 
          alt={`Luxury ${car.make} ${car.model} available at AutoSphere`} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
        
        <div className="absolute top-4 right-4">
           <span className={`backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${getListingTypeColor()}`}>
            {getListingTypeLabel()}
          </span>
        </div>

        <div className="absolute bottom-4 left-6">
          <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] uppercase tracking-widest border border-white/20">
            {car.type}
          </span>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold group-hover:text-zinc-300 transition-colors">{car.make}</h3>
            <p className="text-sm text-zinc-400">{car.model} • {car.year}</p>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold">
              {formatPrice(car.price)}
              {car.listingType === 'Rent' && <span className="text-[10px] text-zinc-500 font-normal ml-1">/ day</span>}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-[11px] text-zinc-500 uppercase tracking-[0.2em] pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            {car.hp} HP
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {car.acceleration}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CarCard;
