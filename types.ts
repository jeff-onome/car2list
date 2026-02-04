
export type UserRole = 'USER' | 'DEALER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isVerified: boolean;
  isSuspended?: boolean;
  joinedAt: string;
  password?: string; // Stored for the sake of this mock implementation
  // Added optional fields for identity verification status and documents
  kycStatus?: 'pending' | 'approved' | 'rejected';
  kycDocuments?: {
    front: string;
    back: string;
    selfie: string;
    submittedAt: string;
  };
}

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number; // Base price in USD
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
  categories: string[]; // Changed from listingType to categories array
  createdAt?: string;
  status: 'pending' | 'approved' | 'rejected' | 'archived';
  archivedBy?: 'ADMIN' | 'DEALER';
  moderationReason?: string;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  rate: number; // vs USD
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

export interface Testimonial {
  id: string;
  text: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface CustomSection {
  isActive: boolean;
  title: string;
  subtitle: string;
  content: string;
  imageUrl: string;
  layout: 'left' | 'right';
}

export interface SiteConfig {
  siteName: string;
  heroTitle: string;
  heroSubtitle: string;
  primaryColor: string;
  featuredBanner: string;
  activeCurrency: string;
  currencies: Record<string, CurrencyConfig>;
  dealOfTheWeek: DealOfTheWeek;
  testimonials: Testimonial[];
  customSections: {
    section1: CustomSection;
    section2: CustomSection;
    section3: CustomSection;
  };
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
