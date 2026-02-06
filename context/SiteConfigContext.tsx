
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
    siteName: 'AutoSphere',
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
      facebook: 'https://facebook.com/autosphere',
      instagram: 'https://instagram.com/autosphere',
      twitter: 'https://twitter.com/autosphere',
      whatsapp: 'https://wa.me/41220000000'
    },
    financials: {
      bankName: 'Global Swiss Trust',
      accountName: 'AutoSphere Curation Group',
      accountNumber: 'CH76 0000 0000 1234 5678 9',
      swiftCode: 'SWISCHZZ',
      btcWallet: '1AutoSphereBitcoinWalletAddressHkd93',
      ethWallet: '0xAutoSphereEthereumWalletAddressK382',
      usdtWallet: 'TAutoSphereUSDTTRC20WalletAddressJ82'
    },
    liveChatScript: '',
    dealOfTheWeek: {
      isActive: true,
      make: 'Ferrari',
      model: '812 GTS',
      description: 'A V12 masterpiece that represents the absolute zenith of open-top performance. This low-mileage example features the exclusive Atelier configuration.',
      price: 450000,
      image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=1200',
      endTime: defaultEndTime
    },
    testimonials: [
      { id: '1', name: 'Julian V.', role: 'Global Collector', text: 'The level of curation at AutoSphere is unmatched. Every vehicle in their inventory is a certified masterpiece, and the concierge service is truly seamless.' },
      { id: '2', name: 'Sophia M.', role: 'Enthusiast', text: 'Securing my first vintage Porsche through AutoSphere was an incredible experience. Their technical transparency and global logistics were flawless.' }
    ],
    customSections: {
      section1: { 
        isActive: true, 
        title: 'Beyond the Drive', 
        subtitle: 'The Experience', 
        content: 'At AutoSphere, we believe that acquiring a luxury automobile is not merely a transaction, but the beginning of a lifelong journey into the world of high-performance engineering and timeless design.', 
        imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200', 
        layout: 'left' 
      }
    },
    inventoryPage: { 
      title: 'Global Showroom', 
      description: 'Explore our meticulously curated selection of the world\'s finest supercars, luxury SUVs, and timeless classic automobiles. Each unit undergoes a rigorous 150-point Sphere Standard inspection.' 
    },
    homePage: { 
      heritageTitle: 'Three Decades of Excellence', 
      heritageText: 'Founded in the heart of Geneva in 1994, AutoSphere has grown from a boutique showroom into a global authority on automotive curation. Our network spans four continents, providing our clients with unprecedented access to off-market assets and limited-edition releases.', 
      servicesTitle: 'Concierge Ecosystem', 
      services: [
        { title: 'Asset Curation', desc: 'Our experts source the rarest vehicles globally, ensuring every acquisition aligns with your collection goals.' },
        { title: 'Global Logistics', desc: 'Secured air and sea freight solutions for door-to-door delivery, no matter where your residence is located.' },
        { title: 'Technical Integrity', desc: 'Every vehicle is certified by factory-trained technicians to guarantee absolute performance.' },
        { title: 'Private Auctions', desc: 'Exclusive access to our high-security bidding platform for the world\'s most sought-after supercars.' }
      ] 
    },
    aboutPage: { 
      heroText: 'AutoSphere represents the intersection of historical automotive legacy and futuristic performance. We don\'t just sell cars; we curate the machines that define an era.', 
      missionTitle: 'Our Mission', 
      missionText: 'To provide a secure, transparent, and unparalleled platform for the global acquisition and management of luxury automotive assets.', 
      valuesTitle: 'Our Values', 
      valuesText: 'Integrity in every specification, precision in every delivery, and exclusivity in every relationship we build with our global member base.', 
      imageUrl: 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=1200' 
    },
    faqPage: [
      { q: 'How is vehicle condition verified?', a: 'Every vehicle undergoes our proprietary Sphere Standard inspection, which includes a comprehensive technical analysis, paint depth verification, and historical documentation review.' },
      { q: 'Do you offer global shipping?', a: 'Yes, we provide fully insured, climate-controlled logistics via our global network of specialized automotive transport partners.' },
      { q: 'Can I sell my collection through AutoSphere?', a: 'Authorized dealers and verified private collectors can apply to enroll their vehicles in our global showroom through the dealer portal.' }
    ],
    contactPage: { 
      address: 'Place du Molard, 1204 Geneva, Switzerland', 
      email: 'concierge@autosphere.com', 
      phone: '+41 22 000 0000', 
      description: 'Our concierge team is available 24/7 to assist with acquisitions, technical inquiries, and private viewings.' 
    },
    financingPage: { 
      heroText: 'AutoSphere Capital provides bespoke financial structures designed for high-net-worth individuals and corporate collections, offering liquidity solutions that respect the value of your assets.', 
      cards: [
        { title: 'Capital Acquisition', desc: 'Competitive rate financing for new and pre-owned acquisitions with flexible amortization schedules.' },
        { title: 'Asset Liquidity', desc: 'Unlock capital from your existing collection with our exclusive equity-release programs.' },
        { title: 'Corporate Leasing', desc: 'Tax-efficient leasing structures for corporate fleets and executive transportation.' }
      ] 
    },
    privacyPolicy: 'Your privacy is our highest priority. AutoSphere employs military-grade encryption to protect your identity and financial telemetry. We never share client data with third parties without explicit authorization.',
    termsOfService: 'Membership at AutoSphere is a privilege. All users must adhere to our code of conduct, which prioritizes transaction integrity and professional communication within our ecosystem.',
    seo: {
      metaTitle: 'AutoSphere | The World\'s Premier Luxury Car Marketplace',
      metaDescription: 'Buy, rent, or auction exclusive luxury cars including Ferrari, Lamborghini, and Porsche. Interactive 3D showroom and global concierge service.',
      keywords: 'luxury cars, supercar marketplace, buy ferrari, exotic car rental, porsche showroom geneva, high-end vehicle auction',
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
