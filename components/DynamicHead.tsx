'use client';

import { useEffect, useState } from 'react';

interface SiteSettings {
  siteName: string;
  siteTitle: string;
  siteDescription: string;
  favicon: string;
}

export default function DynamicHead() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/public/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        
        // Update document title
        if (data.siteTitle) {
          document.title = data.siteTitle;
        }
        
        // Update favicon
        if (data.favicon) {
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = data.favicon;
        }
        
        // Update meta description
        if (data.siteDescription) {
          let meta = document.querySelector("meta[name='description']") as HTMLMetaElement;
          if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'description';
            document.head.appendChild(meta);
          }
          meta.content = data.siteDescription;
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  return null;
}
