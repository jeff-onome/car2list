
export type UserRole = 'USER' | 'DEALER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isVerified: boolean;
  joinedAt: string;
}

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  type: 'Luxury' | 'Sports' | 'SUV' | 'Classic';
  transmission: 'Automatic' | 'Manual';
  fuel: 'Petrol' | 'Electric' | 'Hybrid';
  mileage: number;
  hp: number;
  acceleration: string;
  images: string[];
  description: string;
  features: string[];
  isFeatured: boolean;
  dealerId: string;
  dealerName?: string;
  listingType: 'New' | 'Used' | 'Rent';
  createdAt?: string;
}

export interface DealOfTheWeek {
  isActive: boolean;
  make: string;
  model: string;
  description: string;
  price: number;
  image: string;
  endTime: string; // ISO string
}

export interface SiteConfig {
  siteName: string;
  heroTitle: string;
  heroSubtitle: string;
  primaryColor: string;
  featuredBanner: string;
  dealOfTheWeek: DealOfTheWeek;
  inventoryPage: {
    title: string;
    description: string;
  };
  homePage: {
    heritageTitle: string;
    heritageText: string;
    servicesTitle: string;
    services: { title: string; desc: string }[];
  };
  aboutPage: {
    heroText: string;
    missionTitle: string;
    missionText: string;
    valuesTitle: string;
    valuesText: string;
    imageUrl: string;
  };
  faqPage: { q: string; a: string }[];
  contactPage: {
    address: string;
    email: string;
    phone: string;
    description: string;
  };
  financingPage: {
    heroText: string;
    cards: { title: string; desc: string }[];
  };
  privacyPolicy: string;
  termsOfService: string;
}

export interface AuthContextType {
  user: User | null;
  login: (role: UserRole, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}
