'use client';

import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/metronic-components/ui/card';
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  AlertCircle,
  BarChart3,
  PieChart,
  Globe,
  FileText,
  Palette,
  Package,
  Users,
  Activity,
} from 'lucide-react';

interface DashboardStats {
  totalDomains: number;
  totalTemplates: number;
  totalPackages: number;
  totalServices: number;
  totalPromos: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

// Memoized Stat Card component
const StatCard = memo(function StatCard({ 
  label, value, icon: IconComponent, bgColor, textColor, borderColor, iconBg 
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  textColor: string;
  borderColor: string;
  iconBg: string;
}) {
  return (
    <div className={`${bgColor} ${borderColor} rounded-xl p-5 border hover:shadow-lg transition-all duration-300`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">{label}</p>
          <p className={`text-2xl font-bold ${textColor} mt-3`}>{value}</p>
        </div>
        <div className={`${iconBg} rounded-lg p-2`}>
          <IconComponent className={`w-6 h-6 ${textColor}`} />
        </div>
      </div>
    </div>
  );
});

// Memoized Loading Skeleton
const DashboardSkeleton = memo(function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen animate-pulse">
      <div className="space-y-2">
        <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-gray-200 rounded-xl h-24"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-200 rounded-xl h-48"></div>
        <div className="bg-gray-200 rounded-xl h-48"></div>
      </div>
    </div>
  );
});

// Quick Navigation Item
const NavItem = memo(function NavItem({ 
  label, href, icon: IconComponent, bgColor, textColor 
}: {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  textColor: string;
}) {
  return (
    <a
      href={href}
      className="flex flex-col items-center justify-center p-6 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
    >
      <div className={`${bgColor} p-4 rounded-lg mb-3 group-hover:scale-110 transition-transform`}>
        <IconComponent className={`w-6 h-6 ${textColor}`} />
      </div>
      <span className="text-sm text-gray-700 group-hover:text-blue-600 font-medium text-center">{label}</span>
    </a>
  );
});

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalDomains: 0,
    totalTemplates: 0,
    totalPackages: 0,
    totalServices: 0,
    totalPromos: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Memoize stat cards data
  const statCards = useMemo(() => [
    { label: 'Domains', value: stats.totalDomains, icon: Globe, bgColor: 'bg-cyan-50', textColor: 'text-cyan-600', borderColor: 'border-cyan-200', iconBg: 'bg-cyan-100' },
    { label: 'Templates', value: stats.totalTemplates, icon: Palette, bgColor: 'bg-pink-50', textColor: 'text-pink-600', borderColor: 'border-pink-200', iconBg: 'bg-pink-100' },
    { label: 'Packages', value: stats.totalPackages, icon: Package, bgColor: 'bg-blue-50', textColor: 'text-blue-600', borderColor: 'border-blue-200', iconBg: 'bg-blue-100' },
    { label: 'Services', value: stats.totalServices, icon: Activity, bgColor: 'bg-yellow-50', textColor: 'text-yellow-600', borderColor: 'border-yellow-200', iconBg: 'bg-yellow-100' },
    { label: 'Promos', value: stats.totalPromos, icon: ShoppingCart, bgColor: 'bg-purple-50', textColor: 'text-purple-600', borderColor: 'border-purple-200', iconBg: 'bg-purple-100' },
    { label: 'Orders', value: stats.totalOrders, icon: FileText, bgColor: 'bg-red-50', textColor: 'text-red-600', borderColor: 'border-red-200', iconBg: 'bg-red-100' },
  ], [stats]);

  // Memoize navigation items
  const navItems = useMemo(() => [
    { label: 'Domains', href: '/admin/domains', icon: Globe, bgColor: 'bg-cyan-100', textColor: 'text-cyan-600' },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingCart, bgColor: 'bg-pink-100', textColor: 'text-pink-600' },
    { label: 'Templates', href: '/admin/templates', icon: Palette, bgColor: 'bg-purple-100', textColor: 'text-purple-600' },
    { label: 'Packages', href: '/admin/packages', icon: Package, bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
    { label: 'Clients', href: '/admin/clients', icon: Users, bgColor: 'bg-green-100', textColor: 'text-green-600' },
    { label: 'Monitoring', href: '/admin/monitoring', icon: BarChart3, bgColor: 'bg-orange-100', textColor: 'text-orange-600' }
  ], []);

  // Memoize calculated values
  const avgOrderValue = useMemo(() => {
    return stats.totalOrders > 0 ? ((stats.totalRevenue / stats.totalOrders)).toLocaleString() : '0';
  }, [stats.totalRevenue, stats.totalOrders]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, here's your admin overview</p>
      </div>

      {/* Stat Cards Grid - Modern Clean Design */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, idx) => (
          <StatCard key={idx} {...card} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Revenue & Orders Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Total Revenue Card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-8 shadow-lg text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider">Total Revenue</p>
                <p className="text-4xl font-bold mt-3">IDR {(stats.totalRevenue).toLocaleString()}</p>
                <p className="text-blue-100 text-sm mt-4">From {stats.totalOrders} orders</p>
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 gap-6">
            {/* Total Orders */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-600 font-semibold uppercase tracking-wider">Total Orders</p>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <FileText className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
              {stats.pendingOrders > 0 && (
                <p className="text-sm text-orange-600 font-medium mt-2">
                  {stats.pendingOrders} pending
                </p>
              )}
            </div>

            {/* Pending Orders */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-600 font-semibold uppercase tracking-wider">Pending Orders</p>
                <div className="bg-red-100 p-3 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.pendingOrders}</p>
              <p className="text-sm text-red-600 font-medium mt-2">Need attention</p>
            </div>
          </div>
        </div>

        {/* Right Column - Quick Stats */}
        <div className="space-y-6">
          {/* Average Order Value */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600 font-semibold uppercase tracking-wider">Avg Order Value</p>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              IDR {avgOrderValue}
            </p>
            <p className="text-xs text-gray-500 mt-2">Based on total revenue</p>
          </div>

          {/* Active Items Summary */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <h3 className="font-bold text-gray-900 mb-4">Active Items</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Domains</span>
                <span className="text-lg font-bold text-purple-600">{stats.totalDomains}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Templates</span>
                <span className="text-lg font-bold text-purple-600">{stats.totalTemplates}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Packages</span>
                <span className="text-lg font-bold text-purple-600">{stats.totalPackages}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Services</span>
                <span className="text-lg font-bold text-purple-600">{stats.totalServices}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Promos</span>
                <span className="text-lg font-bold text-purple-600">{stats.totalPromos}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Footer */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Navigation</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {navItems.map((action, idx) => (
            <NavItem key={idx} {...action} />
          ))}
        </div>
      </div>
    </div>
  );
}
