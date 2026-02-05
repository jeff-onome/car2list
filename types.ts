
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
  password?: string;
  favorites?: string[];
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
  categories: string[];
  createdAt?: string;
  status: 'pending' | 'approved' | 'rejected' | 'archived';
  archivedBy?: 'ADMIN' | 'DEALER';
  moderationReason?: string;
}

export interface Rental {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  carId: string;
  carName: string;
  dealerId: string;
  dealerName: string;
  startDate: string;
  duration: number;
  location: string;
  totalPrice: number;
  status: 'Pending' | 'Accepted' | 'Cancelled' | 'Completed';
  createdAt: string;
  securityOption: string;
}

export interface Payment {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  method: 'Bank Transfer' | 'Crypto' | 'Card';
  status: 'Pending' | 'Verified' | 'Rejected';
  referenceId: string; // TX Hash or Receipt Number
  createdAt: string;
  itemType: 'Purchase' | 'Rental';
  itemId: string; // CarId or RentalId
  itemDescription: string;
}

export interface PlatformFinancials {
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode: string;
  btcWallet: string;
  ethWallet: string;
  usdtWallet: string;
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

export interface CurrencyConfig {
  code: string;
  symbol: string;
  rate: number;
}

export interface SiteConfig {
  siteName: string;
  heroTitle: string;
  heroSubtitle: string;
  primaryColor: string;
  featuredBanner: string;
  activeCurrency: string;
  currencies: Record<string, CurrencyConfig>;
  dealOfTheWeek: any;
  testimonials: Testimonial[];
  socialLinks: Record<string, string>;
  customSections: Record<string, CustomSection>;
  financials: PlatformFinancials;
  liveChatScript: string; // Dynamic integration field
  inventoryPage: any;
  homePage: any;
  aboutPage: any;
  faqPage: any[];
  contactPage: any;
  financingPage: any;
  privacyPolicy: string;
  termsOfService: string;
}
