
import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  schema?: object;
}

const SEO: React.FC<SEOProps> = ({ title, description, schema }) => {
  useEffect(() => {
    // Update Title
    document.title = `${title} | AutoSphere`;

    // Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Inject JSON-LD Schema
    const existingScript = document.getElementById('json-ld-schema');
    if (existingScript) {
      existingScript.remove();
    }

    if (schema) {
      const script = document.createElement('script');
      script.id = 'json-ld-schema';
      script.type = 'application/ld+json';
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    }
  }, [title, description, schema]);

  return null;
};

export default SEO;
