
import React, { useState, useMemo } from 'react';
import { useCars } from '../../context/CarContext';
import { useSiteConfig } from '../../context/SiteConfigContext';
import CarCard from '../components/CarCard';
import SEO from '../../components/SEO';
import LoadingScreen from '../../components/LoadingScreen';

const Inventory: React.FC = () => {
  const { cars, isLoading: carsLoading } = useCars();
  const { config, isLoading: configLoading } = useSiteConfig();
  const [filter, setFilter] = useState({
    type: 'All',
    category: 'All',
    sort: 'newest'
  });

  const filteredCars = useMemo(() => {
    let result = cars.filter(car => {
      const isApproved = car.status === 'approved';
      const matchType = filter.type === 'All' || car.type === filter.type;
      const carCats = car.categories || [];
      const matchCategory = filter.category === 'All' || carCats.includes(filter.category);
      
      return isApproved && matchType && matchCategory;
    });

    if (filter.sort === 'price-low') result.sort((a, b) => a.price - b.price);
    if (filter.sort === 'price-high') result.sort((a, b) => b.price - a.price);
    
    return result;
  }, [cars, filter]);

  if (carsLoading || configLoading) return <LoadingScreen />;

  const inventorySchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Luxury Car Inventory",
    "description": "Premium selection of luxury vehicles, supercars, and classic automobiles available for purchase or rent.",
    "numberOfItems": filteredCars.length,
    "itemListElement": filteredCars.map((car, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${window.location.origin}/#/car/${car.id}`,
      "name": `${car.year} ${car.make} ${car.model}`,
      "image": car.images[0]
    }))
  };

  const types = ['All', 'Luxury', 'Sports', 'SUV', 'Classic'];
  const categoryOptions = [
    'All', 'New', 'Pre-Owned', 'Rental', 'Limited Edition', 'Auction'
  ];

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-4 md:px-12">
      <SEO 
        title="Exclusive Car Inventory | Luxury Supercars & Classics" 
        description={`Browse our premium collection of ${filteredCars.length} luxury vehicles. Find elite brands like Ferrari, Porsche, and Lamborghini.`} 
        keywords="luxury car inventory, supercar sales, exotic car rentals, classic car showroom"
        schema={inventorySchema}
      />
      
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 uppercase tracking-tighter">{config.inventoryPage.title}</h1>
          <p className="text-zinc-500 text-sm md:text-base leading-relaxed">{config.inventoryPage.description}</p>
        </header>

        <section className="glass p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] mb-8 md:mb-12 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            <div className="flex flex-col gap-2 flex-grow sm:flex-grow-0">
              <label htmlFor="category-filter" className="text-[10px] uppercase tracking-widest text-zinc-500 ml-2 font-bold">Vehicle Class</label>
              <select 
                id="category-filter"
                className="bg-zinc-900 border border-white/10 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 text-white w-full appearance-none pr-10"
                value={filter.category}
                onChange={e => setFilter({ ...filter, category: e.target.value })}
              >
                {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2 flex-grow sm:flex-grow-0">
              <label htmlFor="type-filter" className="text-[10px] uppercase tracking-widest text-zinc-500 ml-2 font-bold">Body Type</label>
              <select 
                id="type-filter"
                className="bg-zinc-900 border border-white/10 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 text-white w-full appearance-none pr-10"
                value={filter.type}
                onChange={e => setFilter({ ...filter, type: e.target.value })}
              >
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full lg:w-auto">
            <label htmlFor="sort-filter" className="text-[10px] uppercase tracking-widest text-zinc-500 ml-2 font-bold">Market Order</label>
            <select 
              id="sort-filter"
              className="bg-zinc-900 border border-white/10 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 text-white w-full appearance-none pr-10"
              value={filter.sort}
              onChange={e => setFilter({ ...filter, sort: e.target.value })}
            >
              <option value="newest">Latest Enrolled</option>
              <option value="price-low">Valuation: Low to High</option>
              <option value="price-high">Valuation: High to Low</option>
            </select>
          </div>
        </section>

        <section aria-label="Car Catalog">
          {filteredCars.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredCars.map(car => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 glass rounded-3xl">
              <h2 className="text-xl text-zinc-400">No telemetry matches your specific parameters.</h2>
              <button onClick={() => setFilter({ type: 'All', category: 'All', sort: 'newest' })} className="mt-4 text-white underline font-bold uppercase tracking-widest text-[10px]">Reset Showroom Parameters</button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Inventory;
