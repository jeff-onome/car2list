
import React from 'react';
import { useCars } from '../../context/CarContext';
import { useSiteConfig } from '../../context/SiteConfigContext';

const Compare: React.FC = () => {
  const { cars, favorites } = useCars();
  const { formatPrice } = useSiteConfig();
  
  // Use user's favorites for comparison, or fallback to first 3 if empty
  const comparisonList = cars.filter(c => favorites.includes(c.id)).slice(0, 4);
  const fallbackList = comparisonList.length === 0 ? cars.slice(0, 3) : [];
  const displayList = comparisonList.length > 0 ? comparisonList : fallbackList;

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-bold uppercase tracking-tighter">Compare Vehicles</h1>
            <p className="text-zinc-500 mt-2 text-[10px] uppercase tracking-widest">Analyzing {displayList.length} Technical Profiles</p>
          </div>
          {comparisonList.length === 0 && (
            <p className="text-zinc-600 text-[9px] uppercase tracking-widest animate-pulse italic">Add favorites to customize this analysis.</p>
          )}
        </div>
        
        {displayList.length > 0 ? (
          <div className="overflow-x-auto custom-scrollbar shadow-2xl rounded-[3rem] border border-white/5 bg-white/[0.01]">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="bg-white/5">
                  <th className="p-10 border-b border-white/10 w-1/5"></th>
                  {displayList.map(car => (
                    <th key={car.id} className="p-10 border-b border-white/10 text-left w-1/4">
                      <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 mb-6 shadow-xl">
                        <img src={car.images[0]} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-105 hover:scale-100" alt={car.model} />
                      </div>
                      <h3 className="text-2xl font-bold uppercase tracking-tighter text-white">{car.make}</h3>
                      <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-bold">{car.model} • {car.year}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <Row label="Market Value" values={displayList.map(c => formatPrice(c.price))} />
                <Row label="Power Output" values={displayList.map(c => `${c.hp} HP`)} />
                <Row label="Velocity (0-100)" values={displayList.map(c => c.acceleration)} />
                <Row label="Energy Source" values={displayList.map(c => c.fuel)} />
                <Row label="Transmission" values={displayList.map(c => c.transmission)} />
                <Row label="Mileage Log" values={displayList.map(c => `${c.mileage.toLocaleString()} MI`)} />
              </tbody>
            </table>
          </div>
        ) : (
          <div className="glass p-24 rounded-[3rem] text-center">
            <h3 className="text-zinc-600 uppercase tracking-widest text-[10px]">No telemetry available for comparison.</h3>
          </div>
        )}
      </div>
    </div>
  );
};

const Row: React.FC<{ label: string; values: string[] }> = ({ label, values }) => (
  <tr className="hover:bg-white/[0.03] transition-colors group">
    <td className="p-8 text-[10px] uppercase tracking-widest text-zinc-500 font-bold border-r border-white/5 bg-black/20">{label}</td>
    {values.map((v, i) => (
      <td key={i} className="p-8 text-sm font-bold tracking-tight text-white">{v}</td>
    ))}
  </tr>
);

export default Compare;
