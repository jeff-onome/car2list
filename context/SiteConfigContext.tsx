
import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteConfig } from '../types';
import { dbService } from '../services/database';

interface SiteConfigContextType {
  config: SiteConfig;
  updateConfig: (newConfig: Partial<SiteConfig>) => void;
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
    dealOfTheWeek: {
      isActive: true,
      make: 'Ferrari',
      model: '812 GTS',
      description: 'The front-engine V12 spider is back. A symphony of power and elegance with exclusive concierge benefits.',
      price: 450000,
      image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=1200',
      endTime: defaultEndTime
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
    setConfig(prev => ({ ...prev, ...newConfig }));
    await dbService.updateSiteConfig(newConfig);
  };

  return (
    <SiteConfigContext.Provider value={{ config, updateConfig, isLoading }}>
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
