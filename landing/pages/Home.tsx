
import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCars } from '../../context/CarContext';
import { useSiteConfig } from '../../context/SiteConfigContext';
import ThreeCarViewer from '../../components/ThreeCarViewer';
import FeaturedGrid from '../components/FeaturedGrid';
import CountdownTimer from '../components/CountdownTimer';
import SEO from '../../components/SEO';
import LoadingScreen from '../../components/LoadingScreen';
import { CustomSection as CustomSectionType } from '../../types';

declare const gsap: any;

const Home: React.FC = () => {
  const { cars, isLoading: carsLoading } = useCars();
  const { config, formatPrice, isLoading: configLoading } = useSiteConfig();
  const heroRef = useRef(null);
  const textRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  
  // Track current time to handle automatic deal expiration without page refresh
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!carsLoading && !configLoading && typeof gsap !== 'undefined') {
      // Hero Background Parallax
      if (bgRef.current && heroRef.current) {
        gsap.to(bgRef.current, {
          yPercent: 20,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true
          }
        });
      }

      // Hero Text Entrance - Staggered Fade
      if (textRef.current) {
        const children = textRef.current.children;
        gsap.fromTo(children, 
          { opacity: 0, y: 40 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 1.5, 
            stagger: 0.15, 
            delay: 0.3, 
            ease: "power4.out" 
          }
        );
      }
      
      // Section Reveals
      gsap.utils.toArray('.reveal').forEach((elem: any) => {
        gsap.fromTo(elem, 
          { opacity: 0, y: 50 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 1.2, 
            scrollTrigger: {
              trigger: elem,
              start: 'top 90%',
              toggleActions: 'play none none none'
            }
          }
        );
      });
    }
  }, [carsLoading, configLoading]);

  const newArrivals = useMemo(() => {
    return cars
      .filter(c => c.status === 'approved' && !c.isSuspended)
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 3);
  }, [cars]);

  const deal = config.dealOfTheWeek;

  // Logic to determine if the deal is both manually active and not yet expired
  const isDealVisible = useMemo(() => {
    if (!deal || !deal.isActive) return false;
    return new Date(deal.endTime).getTime() > now;
  }, [deal, now]);

  if (carsLoading || configLoading) return <LoadingScreen />;

  const homeSchema = [
    {
      "@context": "https://schema.org",
      "@type": "CarDealer",
      "name": config.siteName,
      "description": config.heroSubtitle,
      "url": window.location.origin,
      "logo": config.seo.ogImage,
      "telephone": config.contactPage.phone,
      "email": config.contactPage.email,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": config.contactPage.address,
        "addressLocality": "Geneva",
        "postalCode": "1204",
        "addressCountry": "CH"
      },
      "sameAs": Object.values(config.socialLinks).filter(link => !!link)
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": config.siteName,
      "url": window.location.origin,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${window.location.origin}/#/inventory?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    }
  ];

  return (
    <div className="bg-black text-white">
      <SEO 
        title={config.seo.metaTitle} 
        description={config.seo.metaDescription} 
        keywords={config.seo.keywords}
        ogImage={config.seo.ogImage}
        schema={homeSchema}
      />
      
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[95vh] flex flex-col items-center justify-center overflow-hidden px-6 pt-20">
        <div ref={bgRef} className="absolute inset-0 opacity-40 will-change-transform">
          <ThreeCarViewer color="#d4af37" />
        </div>
        
        <div ref={textRef} className="relative z-10 text-center max-w-4xl">
          <span className="text-xs uppercase tracking-[0.5em] text-zinc-500 mb-4 block">Elite Automotive Curation</span>
          <h1 className="text-6xl md:text-9xl font-bold mb-6 gradient-text leading-tight tracking-tighter">
            {config.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            {config.heroSubtitle}
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link to="/inventory" className="w-full md:w-auto px-12 py-5 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-all uppercase tracking-widest text-sm shadow-2xl">
              Explore Inventory
            </Link>
            <Link to="/about" className="w-full md:w-auto px-12 py-5 border border-white/20 rounded-full hover:bg-white/5 transition-all uppercase tracking-widest text-sm backdrop-blur-sm">
              Our Legacy
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Heritage */}
      <section className="py-32 bg-zinc-950 border-y border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <article className="reveal">
            <header>
              <span className="text-xs uppercase tracking-[0.4em] text-zinc-500 mb-4 block">Geneva Automotive Heritage</span>
              <h2 className="text-4xl md:text-6xl font-bold mb-8 uppercase tracking-tighter leading-tight">{config.homePage.heritageTitle}</h2>
            </header>
            <div className="space-y-8">
              <p className="text-zinc-400 text-lg leading-relaxed border-l-2 border-white/10 pl-8">
                {config.homePage.heritageText}
              </p>
            </div>
          </article>
          <div className="reveal rounded-[3rem] overflow-hidden glass aspect-square group">
             <img src="https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" alt="Exclusive Luxury Car Showroom in Geneva" loading="lazy" />
          </div>
        </div>
      </section>

      {/* Dynamic Custom Sections */}
      {Object.values(config.customSections).map((sec: CustomSectionType, idx: number) => sec.isActive && (
        <section key={idx} className={`py-32 overflow-hidden ${idx % 2 === 0 ? 'bg-black' : 'bg-zinc-950'}`}>
          <div className={`max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${sec.layout === 'right' ? 'lg:flex-row-reverse' : ''}`}>
             <article className={`reveal ${sec.layout === 'right' ? 'lg:order-2' : 'lg:order-1'}`}>
                <span className="text-xs uppercase tracking-[0.4em] text-zinc-500 mb-4 block">{sec.subtitle}</span>
                <h2 className="text-4xl md:text-6xl font-bold mb-8 uppercase tracking-tighter leading-tight">{sec.title}</h2>
                <p className="text-zinc-400 text-lg leading-relaxed">{sec.content}</p>
             </article>
             <div className={`reveal rounded-[3rem] overflow-hidden glass aspect-[4/3] group ${sec.layout === 'right' ? 'lg:order-1' : 'lg:order-2'}`}>
                <img src={sec.imageUrl} className="w-full h-full object-cover opacity-70 group-hover:scale-110 transition-transform duration-1000" alt={sec.title} loading="lazy" />
             </div>
          </div>
        </section>
      ))}

      {/* Deal of the Week - Automatically hidden when expired or inactive */}
      {isDealVisible && (
        <section className="py-24 bg-black border-y border-white/5 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 reveal">
             <div className="glass rounded-[3rem] overflow-hidden flex flex-col lg:flex-row items-stretch border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                <div className="w-full lg:w-3/5 relative min-h-[400px]">
                   <img src={deal.image} className="absolute inset-0 w-full h-full object-cover" alt={`Featured Deal: ${deal.make} ${deal.model} Supercar`} loading="lazy" />
                   <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent lg:hidden" />
                   
                   <div className="absolute bottom-6 left-6 right-6 md:right-auto md:bottom-10 md:left-10 pointer-events-none flex">
                      <div className="bg-white/10 backdrop-blur-xl px-4 py-3 rounded-2xl md:rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest border border-white/20 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center max-w-full shadow-2xl">
                         <span className="text-white/60 whitespace-nowrap">Exclusive Collection</span>
                         <span className="hidden md:inline text-white/20">•</span>
                         <span className="text-white whitespace-normal break-all md:break-normal">
                            {formatPrice(deal.price)}
                         </span>
                      </div>
                   </div>
                </div>
                <div className="w-full lg:w-2/5 p-10 md:p-16 flex flex-col justify-center space-y-10 bg-zinc-950/50">
                   <header>
                      <span className="text-xs uppercase tracking-[0.4em] text-zinc-500 mb-4 block">Investment Opportunity</span>
                      <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-4 leading-none">Deal of <br/> the Week</h2>
                      <p className="text-zinc-400 text-lg">{deal.description || `Secure the magnificent ${deal.make} ${deal.model} with exclusive concierge benefits.`}</p>
                   </header>
                   <div className="py-4 border-y border-white/5">
                      <CountdownTimer endTime={deal.endTime} />
                   </div>
                   <div className="flex flex-col sm:flex-row gap-4">
                      <Link 
                        to={deal.carId ? `/car/${deal.carId}` : '/inventory'} 
                        className="flex-grow text-center bg-white text-black px-10 py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all shadow-xl"
                      >
                         Inquire Now
                      </Link>
                      <Link to="/inventory" className="flex-grow text-center border border-white/10 px-10 py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-all">
                         Explore More
                      </Link>
                   </div>
                </div>
             </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-32 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 reveal">
            <span className="text-xs uppercase tracking-[0.5em] text-zinc-500 block mb-4">Elite Collector Feedback</span>
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter">Verified Reviews</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {config.testimonials.map((t, i) => (
              <div key={t.id} className="glass p-10 rounded-[3rem] border-white/5 space-y-8 flex flex-col reveal">
                <div className="flex-grow">
                   <p className="text-zinc-400 text-lg italic leading-relaxed">"{t.text}"</p>
                </div>
                <div className="flex items-center gap-4 pt-8 border-t border-white/5">
                   <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 border border-white/10">
                      <img src={t.avatar || `https://i.pravatar.cc/150?u=${t.id}`} className="w-full h-full object-cover" alt={`${t.name} - ${t.role}`} />
                   </div>
                   <div>
                      <h3 className="font-bold text-sm uppercase tracking-widest">{t.name}</h3>
                      <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">{t.role}</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Inventory / New Arrivals */}
      <section className="py-32 px-6 md:px-12 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 reveal gap-8">
            <header className="space-y-4">
              <span className="text-xs text-zinc-500 uppercase tracking-[0.5em]">Curated Stock</span>
              <h2 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter">Luxury New Arrivals</h2>
            </header>
            <Link to="/inventory" className="text-sm font-bold border-b-2 border-white/20 pb-2 hover:text-zinc-400 hover:border-white transition-all uppercase tracking-widest">Full Collection Registry</Link>
          </div>
          <div className="reveal">
            <FeaturedGrid cars={newArrivals} />
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-32 bg-zinc-950 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
           <header className="max-w-3xl mb-24 reveal">
              <span className="text-xs uppercase tracking-[0.5em] text-zinc-500 mb-4 block">Bespoke Concierge</span>
              <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter">{config.homePage.servicesTitle}</h2>
           </header>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {config.homePage.services.map((service, idx) => (
                <article key={idx} className="glass p-10 rounded-[3rem] hover:border-white/40 hover:bg-white/5 transition-all reveal group cursor-default">
                  <div className="w-10 h-1 bg-white/10 mb-8 group-hover:w-full group-hover:bg-white transition-all duration-500" />
                  <h3 className="text-xl font-bold mb-4 uppercase tracking-widest leading-tight">{service.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{service.desc}</p>
                </article>
              ))}
           </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
