
import React from 'react';
import { useCars } from '../../context/CarContext';
import { useUserData } from '../../context/UserDataContext';
import CarCard from '../../landing/components/CarCard';

const Garage: React.FC = () => {
  const { cars, favorites } = useCars();
  const { userData } = useUserData();

  const favCars = cars.filter(c => favorites.includes(c.id));
  const recentCars = cars.filter(c => userData.recentlyViewed.includes(c.id));

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-16">
        <div>
          <h1 className="text-4xl font-bold mb-8 uppercase tracking-tighter">My Garage</h1>
          
          <section className="space-y-8">
            <h2 className="text-xl font-medium text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-2">Favorites</h2>
            {favCars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {favCars.map(car => <CarCard key={car.id} car={car} />)}
              </div>
            ) : (
              <p className="text-zinc-600 italic">No favorites added yet.</p>
            )}
          </section>
        </div>

        <section className="space-y-8">
          <h2 className="text-xl font-medium text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-2">Recently Viewed</h2>
          {recentCars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentCars.map(car => <CarCard key={car.id} car={car} />)}
            </div>
          ) : (
            <p className="text-zinc-600 italic">No viewing history found.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default Garage;
