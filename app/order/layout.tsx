'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import Link from 'next/link';

// Memoized header component to prevent re-renders
const Header = memo(function Header({ siteName }: { siteName: string }) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link href="/" className="text-xl font-bold text-gray-900 hover:text-cyan-600 transition-colors">
          {siteName}
        </Link>
      </div>
    </header>
  );
});

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [siteName, setSiteName] = useState('Website Pesan Jasa');

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/public/settings', {
        // Cache settings for 5 minutes
        next: { revalidate: 300 }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.siteName) {
          setSiteName(data.siteName);
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header siteName={siteName} />
      <main>{children}</main>
    </div>
  )
}
