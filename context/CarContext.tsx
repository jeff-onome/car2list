
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Car } from '../types';
import { dbService } from '../services/database';
import { useAuth } from './AuthContext';
import Swal from 'https://esm.sh/sweetalert2@11';
import { useNavigate } from 'react-router-dom';

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cars, setCars] = useState<Car[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync cars
  useEffect(() => {
    const unsubscribe = dbService.subscribeToCars((updatedCars) => {
      setCars(updatedCars);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync favorites when user changes
  useEffect(() => {
    if (user?.id) {
      // Re-fetch user from DB to get current favorites
      dbService.getUsers().then(users => {
        const found = users.find(u => u.id === user.id);
        if (found && found.favorites) {
          setFavorites(found.favorites);
        } else {
          setFavorites([]);
        }
      });
    } else {
      setFavorites([]);
    }
  }, [user]);

  const toggleFavorite = async (id: string) => {
    if (!user) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'Please sign in to add this masterpiece to your private garage.',
        icon: 'info',
        background: '#0a0a0a',
        color: '#fff',
        confirmButtonColor: '#fff',
        confirmButtonText: 'SIGN IN',
        showCancelButton: true,
        cancelButtonText: 'CANCEL',
        customClass: {
          popup: 'glass rounded-[2rem] border border-white/10 shadow-2xl',
          confirmButton: 'bg-white text-black px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest',
          cancelButton: 'text-zinc-500 font-bold text-[10px] uppercase tracking-widest bg-transparent border border-white/10'
        }
      }).then((result) => {
        if (result.isConfirmed) navigate('/login');
      });
      return;
    }

    const newFavs = favorites.includes(id)
      ? favorites.filter(fid => fid !== id)
      : [...favorites, id];

    setFavorites(newFavs);

    try {
      await dbService.updateUser(user.id, { favorites: newFavs });
      
      const car = cars.find(c => c.id === id);
      if (!favorites.includes(id) && car) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: `${car.make} added to garage`,
          showConfirmButton: false,
          timer: 2000,
          background: '#111',
          color: '#fff'
        });
      }
    } catch (error) {
      console.error("Failed to sync favorites:", error);
    }
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
