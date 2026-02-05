
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
    heroTitle: 'Elegance in Motion',
    heroSubtitle: 'Discover the world\'s most exclusive luxury automobiles.',
    primaryColor: '#ffffff',
    featuredBanner: 'Luxury Redefined',
    activeCurrency: 'USD',
    currencies: {
      USD: { code: 'USD', symbol: '$', rate: 1 },
      EUR: { code: 'EUR', symbol: '€', rate: 0.92 },
      GBP: { code: 'GBP', symbol: '£', rate: 0.78 }
    },
    socialLinks: {
      facebook: 'https://facebook.com/autosphere',
      instagram: 'https://instagram.com/autosphere'
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
    liveChatScript: '', // Initialized as empty
    dealOfTheWeek: {
      isActive: true,
      make: 'Ferrari',
      model: '812 GTS',
      description: 'V12 masterpiece.',
      price: 450000,
      image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=1200',
      endTime: defaultEndTime
    },
    testimonials: [],
    customSections: {
      section1: { isActive: true, title: 'Beyond Drive', subtitle: 'Experience', content: '...', imageUrl: '', layout: 'left' }
    },
    inventoryPage: { title: 'Inventory', description: 'Collection' },
    homePage: { heritageTitle: '30 Years', heritageText: '...', servicesTitle: 'Services', services: [] },
    aboutPage: { heroText: '...', missionTitle: 'Mission', missionText: '...', valuesTitle: 'Values', valuesText: '...', imageUrl: '' },
    faqPage: [],
    contactPage: { address: 'Geneva', email: 'concierge@autosphere.com', phone: '+41 22 000 0000', description: '24/7' },
    financingPage: { heroText: 'Capital', cards: [] },
    privacyPolicy: '...',
    termsOfService: '...'
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

  // Injection Logic for Live Chat Scripts
  useEffect(() => {
    if (!config.liveChatScript) {
      // Remove any previously injected scripts if the value is cleared
      const existingScripts = document.querySelectorAll('.dynamic-integration-script');
      existingScripts.forEach(s => s.remove());
      return;
    }

    try {
      // Cleanup existing dynamic scripts to prevent duplication on config change
      const existingScripts = document.querySelectorAll('.dynamic-integration-script');
      existingScripts.forEach(s => s.remove());

      const parser = new DOMParser();
      const doc = parser.parseFromString(`<div>${config.liveChatScript}</div>`, 'text/html');
      const scripts = doc.querySelectorAll('script');

      scripts.forEach(s => {
        const newScript = document.createElement('script');
        // Copy all attributes (src, async, defer, etc.)
        Array.from(s.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        // Copy inline content if any
        if (s.innerHTML) {
          newScript.innerHTML = s.innerHTML;
        }
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
