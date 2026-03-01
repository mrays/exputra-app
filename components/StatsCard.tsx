'use client';

import { ReactNode } from 'react';

interface StatsCardProps {
  value: number;
  label: string;
  icon: ReactNode;
  color: string;
}

export default function StatsCard({ value, label, icon, color }: StatsCardProps) {
  return (
    <div className={`${color} rounded-lg p-4 transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between mb-2">
        <span className="inline-block">{icon}</span>
      </div>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-xs font-medium opacity-75">{label}</p>
    </div>
  );
}
