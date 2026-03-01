'use client';

import { DollarSign, TrendingUp, Calendar, CreditCard } from 'lucide-react';

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  package?: {
    name?: string;
    duration: number;
  } | null;
}

interface SubscriptionSummaryProps {
  orders: Order[];
}

export default function SubscriptionSummary({ orders }: SubscriptionSummaryProps) {
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const completedOrders = orders.filter(o => o.status === 'COMPLETED').length;
  const activeOrders = orders.filter(o => ['PAID', 'PROCESSING', 'COMPLETED'].includes(o.status)).length;
  const totalYears = orders.reduce((sum, order) => sum + (order.package?.duration || 1), 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
      {/* Total Spent */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg md:rounded-xl shadow-lg p-4 md:p-6 text-white hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className="text-xs md:text-sm font-semibold opacity-90">Total Pembayaran</h3>
          <DollarSign className="w-4 md:w-5 h-4 md:h-5 opacity-80 flex-shrink-0" />
        </div>
        <p className="text-xl md:text-3xl font-bold line-clamp-1">IDR {(totalSpent / 1000000).toFixed(1)}M</p>
        <p className="text-xs text-blue-100 mt-1 md:mt-2">{orders.length} pesanan</p>
      </div>

      {/* Active Subscriptions */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg md:rounded-xl shadow-lg p-4 md:p-6 text-white hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className="text-xs md:text-sm font-semibold opacity-90">Aktif Sekarang</h3>
          <TrendingUp className="w-4 md:w-5 h-4 md:h-5 opacity-80 flex-shrink-0" />
        </div>
        <p className="text-xl md:text-3xl font-bold">{activeOrders}</p>
        <p className="text-xs text-green-100 mt-1 md:mt-2">dari {orders.length} pesanan</p>
      </div>

      {/* Total Years */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg md:rounded-xl shadow-lg p-4 md:p-6 text-white hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className="text-xs md:text-sm font-semibold opacity-90">Durasi Layanan</h3>
          <Calendar className="w-4 md:w-5 h-4 md:h-5 opacity-80 flex-shrink-0" />
        </div>
        <p className="text-xl md:text-3xl font-bold">{totalYears}</p>
        <p className="text-xs text-purple-100 mt-1 md:mt-2">tahun total</p>
      </div>

      {/* Completed */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg md:rounded-xl shadow-lg p-4 md:p-6 text-white hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className="text-xs md:text-sm font-semibold opacity-90">Pesanan Selesai</h3>
          <CreditCard className="w-4 md:w-5 h-4 md:h-5 opacity-80 flex-shrink-0" />
        </div>
        <p className="text-xl md:text-3xl font-bold">{completedOrders}</p>
        <p className="text-xs text-orange-100 mt-1 md:mt-2">website siap pakai</p>
      </div>
    </div>
  );
}
