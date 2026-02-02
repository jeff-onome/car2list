
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Car } from '../types';
import { dbService } from '../services/database';
import { MOCK_CARS } from '../constants';

interface CarContextType {
  cars: Car[];
  favorites: string[];
  toggleFavorite: (id: string) => void;
  getCarById: (id: string) => Car | undefined;
  isLoading: boolean;
  addCar: (car: Omit<Car, 'id'>) => Promise<string | null>;
}

const CarContext = createContext<CarContextType | undefined>(undefined);

export const CarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Start real-time subscription
    const unsubscribe = dbService.subscribeToCars((updatedCars) => {
      // If DB is empty, seed with mock data for the first time (optional)
      if (updatedCars.length === 0 && cars.length === 0) {
        // Only seed if you want initial data
        // MOCK_CARS.forEach(car => dbService.addCar(car));
      }
      setCars(updatedCars);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const getCarById = (id: string) => cars.find(c => c.id === id);

  const addCar = async (car: Omit<Car, 'id'>) => {
    try {
      return await dbService.addCar(car);
    } catch (error) {
      console.error("Error adding car to Firebase:", error);
      return null;
    }
  };

  return (
    <CarContext.Provider value={{ cars, favorites, toggleFavorite, getCarById, isLoading, addCar }}>
      {children}
    </CarContext.Provider>
  );
};

export const useCars = () => {
  const context = useContext(CarContext);
  if (context === undefined) {
    throw new Error('useCars must be used within a CarProvider');
  }
  return context;
};
