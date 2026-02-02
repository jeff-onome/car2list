
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCars } from '../../context/CarContext';
import { useSiteConfig } from '../../context/SiteConfigContext';
import ThreeCarViewer from '../../components/ThreeCarViewer';
import FeaturedGrid from '../components/FeaturedGrid';
import CountdownTimer from '../components/CountdownTimer';

declare const gsap: any;

const Home: React.FC = () => {
  const { cars } = useCars();
  const { config } = useSiteConfig();
  const heroRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(textRef.current, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 0.5, ease: "power4.out" }
      );
      
      gsap.utils.toArray('.reveal').forEach((elem: any) => {
        gsap.fromTo(elem, 
          { opacity: 0, y: 50 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 1, 
            scrollTrigger: {
              trigger: elem,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        );
      });
    }
  }, []);

  const featuredCars = cars.filter(c => c.isFeatured);
  const deal = config.dealOfTheWeek;

  return (
    <div className="bg-black text-white">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[95vh] flex flex-col items-center justify-center overflow-hidden px-6 pt-20">
        <div className="absolute inset-0 opacity-40">
          <ThreeCarViewer color="#d4af37" />
        </div>
        
        <div ref={textRef} className="relative z-10 text-center max-w-4xl">
          <span className="text-xs uppercase tracking-[0.5em] text-zinc-500 mb-4 block">Redefining Performance</span>
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

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-20">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7-7-7" /></svg>
        </div>
      </section>

      {/* Section 1: Brand Heritage Timeline */}
      <section className="py-32 bg-zinc-950 border-y border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="reveal">
            <span className="text-xs uppercase tracking-[0.4em] text-zinc-500 mb-4 block">The Genesis</span>
            <h2 className="text-4xl md:text-6xl font-bold mb-8 uppercase tracking-tighter leading-tight">{config.homePage.heritageTitle}</h2>
            <div className="space-y-8">
              <p className="text-zinc-400 text-lg leading-relaxed border-l-2 border-white/10 pl-8">
                {config.homePage.heritageText}
              </p>
            </div>
          </div>
          <div className="reveal rounded-[3rem] overflow-hidden glass aspect-square group">
             <img src="https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" alt="Vintage Showroom" />
          </div>
        </div>
      </section>

      {/* Section 2: Deal of the Week */}
      {deal.isActive && (
        <section className="py-24 bg-black border-y border-white/5 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 reveal">
             <div className="glass rounded-[3rem] overflow-hidden flex flex-col lg:flex-row items-stretch border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                <div className="w-full lg:w-3/5 relative min-h-[400px]">
                   <img src={deal.image} className="absolute inset-0 w-full h-full object-cover" alt="Deal Car" />
                   <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent lg:hidden" />
                   <div className="absolute bottom-10 left-10">
                      <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-white/30">
                         Limited Edition • ${deal.price.toLocaleString()}
                      </span>
                   </div>
                </div>
                <div className="w-full lg:w-2/5 p-10 md:p-16 flex flex-col justify-center space-y-10 bg-zinc-950/50">
                   <div>
                      <span className="text-xs uppercase tracking-[0.4em] text-zinc-500 mb-4 block">Time-Limited Acquisition</span>
                      <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-4 leading-none">Deal of <br/> the Week</h2>
                      <p className="text-zinc-400 text-lg">{deal.description || `Secure the magnificent ${deal.make} ${deal.model} with exclusive concierge benefits.`}</p>
                   </div>
                   <div className="py-4 border-y border-white/5">
                      <CountdownTimer endTime={deal.endTime} />
                   </div>
                   <div className="flex flex-col sm:flex-row gap-4">
                      <Link to="/inventory" className="flex-grow text-center bg-white text-black px-10 py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all shadow-xl">
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

      {/* Section 3: Featured Inventory Grid */}
      <section className="py-32 px-6 md:px-12 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 reveal gap-8">
            <div className="space-y-4">
              <span className="text-xs text-zinc-500 uppercase tracking-[0.5em]">Private Stock</span>
              <h2 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter">New Arrivals</h2>
            </div>
            <Link to="/inventory" className="text-sm font-bold border-b-2 border-white/20 pb-2 hover:text-zinc-400 hover:border-white transition-all uppercase tracking-widest">View Full Collection</Link>
          </div>
          <div className="reveal">
            <FeaturedGrid cars={featuredCars} />
          </div>
        </div>
      </section>

      {/* Section 4: Premier Luxury Services */}
      <section className="py-32 bg-black border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
           <div className="max-w-3xl mb-24 reveal">
              <span className="text-xs uppercase tracking-[0.5em] text-zinc-500 mb-4 block">Excellence Guaranteed</span>
              <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter">{config.homePage.servicesTitle}</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {config.homePage.services.map((service, idx) => (
                <ServiceCard key={idx} title={service.title} desc={service.desc} />
              ))}
           </div>
        </div>
      </section>

      {/* Section 5: Global Strategic Network */}
      <section className="py-32 bg-zinc-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center reveal">
           <h2 className="text-4xl md:text-7xl font-bold mb-16 uppercase tracking-tighter">A Truly Global Network</h2>
           <div className="relative aspect-[21/9] glass rounded-[4rem] flex items-center justify-center overflow-hidden group">
              <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1200" className="absolute inset-0 w-full h-full object-cover opacity-10 grayscale group-hover:opacity-20 transition-all duration-1000" alt="World Map" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-12 relative z-10 w-full px-12">
                 <LocationPoint city="Geneva" desc="HQ & Heritage Center" />
                 <LocationPoint city="Dubai" desc="MENA Logistics Hub" />
                 <LocationPoint city="London" desc="Private Viewing Gallery" />
                 <LocationPoint city="Tokyo" desc="Exotic Import Division" />
              </div>
           </div>
        </div>
      </section>
    </div>
  );
};

const ServiceCard = ({ title, desc }: any) => (
  <div className="glass p-10 rounded-[3rem] hover:border-white/40 hover:bg-white/5 transition-all reveal group cursor-default">
    <div className="w-10 h-1 bg-white/10 mb-8 group-hover:w-full group-hover:bg-white transition-all duration-500" />
    <h4 className="text-xl font-bold mb-4 uppercase tracking-widest leading-tight">{title}</h4>
    <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

const LocationPoint = ({ city, desc }: any) => (
  <div className="space-y-3">
     <h4 className="text-2xl font-bold uppercase tracking-tighter text-white">{city}</h4>
     <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">{desc}</p>
  </div>
);

export default Home;
