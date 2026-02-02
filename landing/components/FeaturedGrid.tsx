
import React from 'react';
import { Car } from '../../types';
import CarCard from './CarCard';

interface FeaturedGridProps {
  cars: Car[];
}

const FeaturedGrid: React.FC<FeaturedGridProps> = ({ cars }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {cars.map(car => (
        <CarCard key={car.id} car={car} />
      ))}
    </div>
  );
};

export default FeaturedGrid;
