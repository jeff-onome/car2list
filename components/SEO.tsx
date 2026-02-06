
import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  schema?: object;
  noIndex?: boolean;
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  keywords, 
  ogImage, 
  ogType = 'website',
  schema, 
  noIndex = false 
}) => {
  const currentUrl = window.location.href;

  useEffect(() => {
    // 1. Title
    document.title = `${title} | AutoSphere`;

    // 2. Meta Tags (Standard)
    const updateMeta = (name: string, property: string, content: string) => {
      let el = document.querySelector(name ? `meta[name="${name}"]` : `meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        if (name) el.setAttribute('name', name);
        if (property) el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    updateMeta('description', '', description);
    if (keywords) updateMeta('keywords', '', keywords);
    
    // 3. Robots
    updateMeta('robots', '', noIndex ? 'noindex, nofollow' : 'index, follow');

    // 4. Open Graph
    updateMeta('', 'og:title', `${title} | AutoSphere`);
    updateMeta('', 'og:description', description);
    updateMeta('', 'og:url', currentUrl);
    updateMeta('', 'og:type', ogType);
    if (ogImage) updateMeta('', 'og:image', ogImage);

    // 5. Twitter
    updateMeta('twitter:card', '', 'summary_large_image');
    updateMeta('twitter:title', '', title);
    updateMeta('twitter:description', '', description);
    if (ogImage) updateMeta('twitter:image', '', ogImage);

    // 6. Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

    // 7. Structured Data (JSON-LD)
    const existingScript = document.getElementById('json-ld-schema');
    if (existingScript) existingScript.remove();

    if (schema) {
      const script = document.createElement('script');
      script.id = 'json-ld-schema';
      script.type = 'application/ld+json';
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    }
  }, [title, description, keywords, ogImage, ogType, schema, noIndex, currentUrl]);

  return null;
};

export default SEO;
