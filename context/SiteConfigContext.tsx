
import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteConfig, Testimonial, CustomSection } from '../types';
import { dbService } from '../services/database';

interface SiteConfigContextType {
  config: SiteConfig;
  updateConfig: (newConfig: Partial<SiteConfig>) => void;
  formatPrice: (usdPrice: number) => string;
  isLoading: boolean;
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

export const SiteConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const defaultEndTime = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  const [config, setConfig] = useState<SiteConfig>({
    siteName: 'AutoSphere',
    heroTitle: 'Elegance in Motion',
    heroSubtitle: 'Discover the world\'s most exclusive luxury automobiles.',
    primaryColor: '#ffffff',
    featuredBanner: 'Luxury Redefined',
    activeCurrency: 'USD',
    currencies: {
      USD: { code: 'USD', symbol: '$', rate: 1 },
      NGN: { code: 'NGN', symbol: '₦', rate: 1550 },
      EUR: { code: 'EUR', symbol: '€', rate: 0.92 },
      GBP: { code: 'GBP', symbol: '£', rate: 0.78 },
      JPY: { code: 'JPY', symbol: '¥', rate: 148.5 },
      CAD: { code: 'CAD', symbol: 'C$', rate: 1.35 },
      AUD: { code: 'AUD', symbol: 'A$', rate: 1.52 },
      CHF: { code: 'CHF', symbol: 'Fr', rate: 0.88 },
      CNY: { code: 'CNY', symbol: '¥', rate: 7.19 },
      ZAR: { code: 'ZAR', symbol: 'R', rate: 18.95 },
      AED: { code: 'AED', symbol: 'د.إ', rate: 3.67 },
      GHS: { code: 'GHS', symbol: '₵', rate: 12.45 }
    },
    dealOfTheWeek: {
      isActive: true,
      make: 'Ferrari',
      model: '812 GTS',
      description: 'The front-engine V12 spider is back. A symphony of power and elegance with exclusive concierge benefits.',
      price: 450000,
      image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=1200',
      endTime: defaultEndTime
    },
    testimonials: [
      { id: '1', text: 'The absolute pinnacle of luxury acquisition. The concierge service made my international delivery seamless.', name: 'Alexander Rothschild', role: 'Private Collector', avatar: 'https://i.pravatar.cc/150?u=alex' },
      { id: '2', text: 'AutoSphere redefined what I expect from a dealership. Their 3D visualization is stunningly accurate.', name: 'Elena Vance', role: 'CEO, Vance Tech', avatar: 'https://i.pravatar.cc/150?u=elena' }
    ],
    customSections: {
      section1: {
        isActive: true,
        title: 'Beyond the Drive',
        subtitle: 'The Experience',
        content: 'Owning a masterpiece is just the beginning. Our lifestyle management ensures your automotive asset is always ready for the moment.',
        imageUrl: 'https://images.unsplash.com/photo-1562141961-b5d185ef3571?q=80&w=1200',
        layout: 'left'
      },
      section2: {
        isActive: true,
        title: 'Global Connectivity',
        subtitle: 'Our Network',
        content: 'With strategic hubs in Geneva, Dubai, and Singapore, we facilitate cross-border transactions with military precision.',
        imageUrl: 'https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?q=80&w=1200',
        layout: 'right'
      },
      section3: {
        isActive: true,
        title: 'Future Heritage',
        subtitle: 'Digital Innovation',
        content: 'We utilize blockchain technology for immutable vehicle history tracking, ensuring your investment provenance is unquestionable.',
        imageUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1200',
        layout: 'left'
      }
    },
    inventoryPage: {
      title: 'Inventory',
      description: 'Browse our curated collection of masterfully engineered vehicles for purchase or rent.'
    },
    homePage: {
      heritageTitle: 'Three Decades of Unrivaled Curation',
      heritageText: 'Foundation of AutoSphere Geneva, a boutique for the most elusive automotive legends. Operating in 15 countries with over $1B in transaction volume, re-defining luxury commerce.',
      servicesTitle: 'Premier Global Services',
      services: [
        { title: 'Bespoke Transport', desc: 'Enclosed, climate-controlled shipping for every acquisition, delivered to your doorstep globally.' },
        { title: 'Heritage Workshop', desc: 'Expert restoration and maintenance performed by manufacturer-certified master technicians.' },
        { title: 'Vault Storage', desc: 'Facility management with 24/7 high-security surveillance and periodic system runs.' },
        { title: 'Capital Solutions', desc: 'Flexible, sophisticated financing and asset-backed lending tailored to your portfolio.' }
      ]
    },
    aboutPage: {
      heroText: 'AutoSphere was born from a singular vision: to curate the most exceptional automotive engineering achievements under one digital roof.',
      missionTitle: 'Our Mission',
      missionText: 'We bridge the gap between discerning collectors and the world\'s finest machinery. Every vehicle in our inventory undergoes a rigorous 200-point inspection to ensure it meets our "Sphere Standard."',
      valuesTitle: 'Our Values',
      valuesText: 'Integrity, Transparency, and Excellence. We believe purchasing a luxury vehicle should be as exhilarating as driving one.',
      imageUrl: 'https://picsum.photos/seed/showroom/1200/600'
    },
    faqPage: [
      { q: "How do I schedule a test drive?", a: "You can schedule a test drive directly from the car detail page. Our concierge will contact you within 2 hours." },
      { q: "Do you offer international shipping?", a: "Yes, AutoSphere partners with elite logistics companies to provide secure international shipping." },
      { q: "What is the Sphere Standard?", a: "A proprietary certification process involving a 200-point technical inspection and full history validation." },
      { q: "Are prices negotiable?", a: "While our prices reflect market value, we are open to discussions with qualified buyers." }
    ],
    contactPage: {
      address: '1200 Automotive Way, Geneva, CH',
      email: 'concierge@autosphere.com',
      phone: '+41 22 761 1111',
      description: 'Our specialized team is available 24/7 to assist with your inquiries, from technical specifications to global logistics.'
    },
    financingPage: {
      heroText: 'Tailored financial structures designed for the acquisition of the world\'s most prestigious automobiles.',
      cards: [
        { title: 'Private Financing', desc: 'Competitive rates for individual collectors with flexible terms up to 84 months.' },
        { title: 'Lease-to-Own', desc: 'Sophisticated leasing structures for tax efficiency and asset management.' },
        { title: 'Equity Release', desc: 'Unlock liquidity from your existing collection with our asset-backed lending.' }
      ]
    },
    privacyPolicy: 'We collect information you provide directly to us when you create an account. This includes your name, contact information, and financial verification documents.',
    termsOfService: 'Access to AutoSphere\'s private listings is restricted to verified members. We reserve the right to revoke membership at any time.'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = dbService.subscribeToConfig((remoteConfig) => {
      if (remoteConfig) {
        setConfig(prev => ({ ...prev, ...remoteConfig }));
      } else {
        dbService.updateSiteConfig(config);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateConfig = async (newConfig: Partial<SiteConfig>) => {
    const updated = { ...config, ...newConfig };
    setConfig(updated);
    await dbService.updateSiteConfig(newConfig);
  };

  const formatPrice = (usdPrice: number): string => {
    const currency = config.currencies[config.activeCurrency] || config.currencies['USD'];
    const converted = usdPrice * currency.rate;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(converted).replace(/[A-Z]{3}/, currency.symbol);
  };

  return (
    <SiteConfigContext.Provider value={{ config, updateConfig, formatPrice, isLoading }}>
      {children}
    </SiteConfigContext.Provider>
  );
};

export const useSiteConfig = () => {
  const context = useContext(SiteConfigContext);
  if (context === undefined) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider');
  }
  return context;
};
