
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSiteConfig } from '../context/SiteConfigContext';
import { FOOTER_LINKS } from '../constants';

const Footer: React.FC = () => {
  const { config } = useSiteConfig();
  const location = useLocation();
  const isPortal = location.pathname.startsWith('/user') || 
                   location.pathname.startsWith('/dealer') || 
                   location.pathname.startsWith('/admin');

  if (isPortal) return null;

  return (
    <footer className="bg-zinc-950 border-t border-white/5 py-16 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
        <div className="space-y-6">
          <Link to="/" className="text-2xl font-bold tracking-tighter gradient-text uppercase block">{config.siteName}</Link>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
            The world's premier destination for luxury automotive enthusiasts. Experience excellence in every mile.
          </p>
          <div className="flex justify-center md:justify-start space-x-4">
             {Object.entries(config.socialLinks).map(([platform, url]) => url && (
               <SocialIcon key={platform} platform={platform as any} href={url} />
             ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
           <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-[10px]">Directory</h4>
              <ul className="space-y-4">
                {FOOTER_LINKS.general.map(l => <li key={l.path}><Link to={l.path} className="text-zinc-500 hover:text-white transition-colors text-sm uppercase tracking-tighter">{l.name}</Link></li>)}
              </ul>
           </div>
           <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-[10px]">Resources</h4>
              <ul className="space-y-4">
                {FOOTER_LINKS.services.map(l => <li key={l.path}><Link to={l.path} className="text-zinc-500 hover:text-white transition-colors text-sm uppercase tracking-tighter">{l.name}</Link></li>)}
              </ul>
           </div>
        </div>

        <div className="flex flex-col items-center md:items-end">
          <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-[10px]">Membership</h4>
          <ul className="space-y-4 text-center md:text-right">
            {FOOTER_LINKS.account.map(l => <li key={l.path}><Link to={l.path} className="text-zinc-500 hover:text-white transition-colors text-sm uppercase tracking-tighter">{l.name}</Link></li>)}
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] text-zinc-600 uppercase tracking-widest">
        <p>© 2024 {config.siteName} Group. Private Collection.</p>
        <div className="flex gap-8 mt-6 md:mt-0">
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
        <p className="mt-6 md:mt-0 italic opacity-40">Designed for the extraordinary.</p>
      </div>
    </footer>
  );
};

interface SocialIconProps {
  platform: 'facebook' | 'twitter' | 'instagram' | 'whatsapp' | 'linkedin';
  href: string;
}

const SocialIcon: React.FC<SocialIconProps> = ({ platform, href }) => {
  const getIcon = () => {
    switch (platform) {
      case 'facebook':
        return <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />;
      case 'twitter':
        return <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />;
      case 'instagram':
        return (
          <>
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </>
        );
      case 'whatsapp':
        return <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />;
      case 'linkedin':
         return <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 2a2 2 0 1 1-2 2 2 2 0 0 1 2-2z" />;
      default:
        return null;
    }
  };

  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-zinc-500 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
      aria-label={platform}
    >
      <svg 
        viewBox="0 0 24 24" 
        className="w-5 h-5 fill-none stroke-current" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        {getIcon()}
      </svg>
    </a>
  );
};

export default Footer;
