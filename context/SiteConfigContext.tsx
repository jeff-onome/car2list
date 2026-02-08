
import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteConfig } from '../types';
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
    siteName: 'Loading...',
    heroTitle: 'The Pinnacle of Automotive Artistry',
    heroSubtitle: 'Welcome to the world\'s most exclusive luxury automobile marketplace, where performance meets heritage and elegance is redefined with every mile.',
    primaryColor: '#ffffff',
    featuredBanner: 'Private Collection: Now Accepting Inquiries',
    activeCurrency: 'USD',
    currencies: {
      USD: { code: 'USD', symbol: '$', rate: 1 },
      EUR: { code: 'EUR', symbol: '€', rate: 0.92 },
      GBP: { code: 'GBP', symbol: '£', rate: 0.78 }
    },
    socialLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
      whatsapp: ''
    },
    financials: {
      bankName: 'Global Swiss Trust',
      accountName: 'Curation Group',
      accountNumber: 'CH76 0000 0000 1234 5678 9',
      swiftCode: 'SWISCHZZ',
      wallets: []
    },
    liveChatScript: '',
    dealOfTheWeek: {
      isActive: true,
      carId: '',
      make: 'Ferrari',
      model: '812 GTS',
      year: 2024,
      description: 'A V12 masterpiece that represents the absolute zenith of open-top performance.',
      price: 450000,
      image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=1200',
      endTime: defaultEndTime,
      type: 'Sports',
      transmission: 'Automatic',
      fuel: 'Petrol',
      mileage: 50,
      hp: 800,
      acceleration: '2.9s',
      categories: ['Limited Edition']
    },
    testimonials: [],
    customSections: {
      section1: { 
        isActive: true, 
        title: 'Beyond the Drive', 
        subtitle: 'The Experience', 
        content: 'Acquiring a luxury automobile is not merely a transaction, but the beginning of a lifelong journey into the world of high-performance engineering.', 
        imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200', 
        layout: 'left' 
      }
    },
    inventoryPage: { 
      title: 'Global Showroom', 
      description: 'Explore our meticulously curated selection of the world\'s finest supercars.' 
    },
    homePage: { 
      heritageTitle: 'Three Decades of Excellence', 
      heritageText: 'Founded in the heart of Geneva, our network spans four continents, providing our clients with unprecedented access to off-market assets.', 
      servicesTitle: 'Concierge Ecosystem', 
      services: [
        { title: 'Asset Curation', desc: 'Our experts source the rarest vehicles globally.' },
        { title: 'Global Logistics', desc: 'Secured air and sea freight solutions.' },
        { title: 'Technical Integrity', desc: 'Every vehicle is certified by factory-trained technicians.' },
        { title: 'Private Auctions', desc: 'Exclusive access to our high-security bidding platform.' }
      ] 
    },
    aboutPage: { 
      heroText: 'We represent the intersection of historical automotive legacy and futuristic performance.', 
      missionTitle: 'Our Mission', 
      missionText: 'To provide a secure, transparent, and unparalleled platform for the global acquisition of luxury automotive assets.', 
      valuesTitle: 'Our Values', 
      valuesText: 'Integrity in every specification, precision in every delivery.', 
      imageUrl: 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=1200' 
    },
    faqPage: [],
    contactPage: { 
      address: 'Place du Molard, 1204 Geneva, Switzerland', 
      email: 'concierge@platform.com', 
      phone: '+41 22 000 0000', 
      description: 'Our concierge team is available 24/7.' 
    },
    financingPage: { 
      heroText: 'Capital solutions designed for high-net-worth individuals and corporate collections.', 
      cards: [
        { title: 'Capital Acquisition', desc: 'Competitive rate financing.' },
        { title: 'Asset Liquidity', desc: 'Unlock capital from your existing collection.' },
        { title: 'Corporate Leasing', desc: 'Tax-efficient leasing structures.' }
      ] 
    },
    privacyPolicy: 'Your privacy is our highest priority. We employ military-grade encryption to protect your identity.',
    termsOfService: 'Membership is a privilege. All users must adhere to our code of conduct.',
    seo: {
      metaTitle: 'Premier Luxury Car Marketplace',
      metaDescription: 'Buy, rent, or auction exclusive luxury cars including Ferrari, Lamborghini, and Porsche.',
      keywords: 'luxury cars, supercar marketplace, buy ferrari, exotic car rental',
      ogImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200'
    }
  });
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = dbService.subscribeToConfig((remoteConfig) => {
      if (remoteConfig) setConfig(prev => ({ ...prev, ...remoteConfig }));
      else dbService.updateSiteConfig(config);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!config.liveChatScript) {
      const existingScripts = document.querySelectorAll('.dynamic-integration-script');
      existingScripts.forEach(s => s.remove());
      return;
    }
    try {
      const existingScripts = document.querySelectorAll('.dynamic-integration-script');
      existingScripts.forEach(s => s.remove());
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<div>${config.liveChatScript}</div>`, 'text/html');
      const scripts = doc.querySelectorAll('script');
      scripts.forEach(s => {
        const newScript = document.createElement('script');
        Array.from(s.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        if (s.innerHTML) newScript.innerHTML = s.innerHTML;
        newScript.classList.add('dynamic-integration-script');
        document.head.appendChild(newScript);
      });
    } catch (error) {
      console.error("Live Chat Script Injection Error:", error);
    }
  }, [config.liveChatScript]);

  const updateConfig = async (newConfig: Partial<SiteConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
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
  if (context === undefined) throw new Error('useSiteConfig must be used within a SiteConfigProvider');
  return context;
};
