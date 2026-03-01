import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  greeting?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  greeting = false,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 18) return 'Selamat Siang';
    return 'Selamat Malam';
  };

  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-gray-900">
        {greeting ? `${getGreeting()}, ` : ''}{title}
      </h1>
      <p className="mt-2 text-gray-600">{subtitle}</p>
    </div>
  );
};

export default DashboardHeader;
