
import { Car } from './types';

export const MOCK_CARS: Car[] = [
  {
    id: '1',
    make: 'Aston Martin',
    model: 'DBS Volante',
    year: 2024,
    price: 320000,
    type: 'Luxury',
    transmission: 'Automatic',
    fuel: 'Petrol',
    mileage: 1200,
    hp: 715,
    acceleration: '3.4s',
    images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200'],
    description: 'The ultimate open-top grand tourer. Brute strength in a beautiful suit.',
    features: ['Bang & Olufsen Sound', 'Quilted Leather', 'Carbon Ceramic Brakes'],
    isFeatured: true,
    dealerId: 'dealer1',
    dealerName: 'Geneva Exotics',
    listingType: 'New',
    createdAt: '2024-05-10T10:30:00Z'
  },
  {
    id: '2',
    make: 'Porsche',
    model: '911 Turbo S',
    year: 2023,
    price: 215000,
    type: 'Sports',
    transmission: 'Automatic',
    fuel: 'Petrol',
    mileage: 4500,
    hp: 640,
    acceleration: '2.6s',
    images: ['https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=1200'],
    description: 'The definitive daily-driver supercar. Unmatched performance and precision.',
    features: ['Sport Chrono Package', 'All-Wheel Drive', 'PASM'],
    isFeatured: true,
    dealerId: 'dealer2',
    dealerName: 'Stuttgart Motors',
    listingType: 'Used',
    createdAt: '2024-05-12T15:45:00Z'
  },
  {
    id: '3',
    make: 'Lamborghini',
    model: 'Urus Performante',
    year: 2024,
    price: 265000,
    type: 'SUV',
    transmission: 'Automatic',
    fuel: 'Petrol',
    mileage: 500,
    hp: 666,
    acceleration: '3.3s',
    images: ['https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80&w=1200'],
    description: 'The first Super Sport Utility Vehicle in the world.',
    features: ['Rally Mode', 'Alcantara Interior', 'Carbon Fiber Hood'],
    isFeatured: false,
    dealerId: 'dealer1',
    dealerName: 'Geneva Exotics',
    listingType: 'New',
    createdAt: '2024-05-14T08:20:00Z'
  },
  {
    id: '4',
    make: 'Ferrari',
    model: '812 GTS',
    year: 2024,
    price: 1500,
    type: 'Sports',
    transmission: 'Automatic',
    fuel: 'Petrol',
    mileage: 100,
    hp: 789,
    acceleration: '2.8s',
    images: ['https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=1200'],
    description: 'The front-engine V12 spider is back. A symphony of power and elegance.',
    features: ['Scuderia Shields', 'Carbon Racing Seats', 'Magneride'],
    isFeatured: true,
    dealerId: 'dealer3',
    dealerName: 'Maranello Elite',
    listingType: 'Rent',
    createdAt: '2024-05-15T12:00:00Z'
  }
];

export const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Inventory', path: '/inventory' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' }
];

export const FOOTER_LINKS = {
  general: [
    { name: 'Home', path: '/' },
    { name: 'Inventory', path: '/inventory' },
    { name: 'About Us', path: '/about' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Contact', path: '/contact' }
  ],
  services: [
    { name: 'Financing', path: '/financing' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' }
  ],
  account: [
    { name: 'Login', path: '/login' },
    { name: 'Register', path: '/register' }
  ]
};
