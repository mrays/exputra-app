'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/metronic-components/ui/card';
import ProgressCircle from './ProgressCircle';
import StatsCard from './StatsCard';
import WorkflowTimeline from './WorkflowTimeline';
import { Calendar, Package, CheckCircle2, Clock } from 'lucide-react';

interface Order {
  id: string;
  invoiceId: string;
  domainName: string;
  customerName: string;
  status: string;
  createdAt: string;
  total: number;
  package?: { duration: number };
}

interface ClientDashboardMiniProps {
  orders: Order[];
}

export default function ClientDashboardMini({ orders }: ClientDashboardMiniProps) {
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    processing: 0,
    pending: 0,
  });

  useEffect(() => {
    if (orders.length === 0) return;

    const completed = orders.filter(o => o.status === 'COMPLETED').length;
    const processing = orders.filter(o => o.status === 'PROCESSING').length;
    const pending = orders.filter(o => o.status === 'PENDING').length;

    const percentage = Math.round((completed / orders.length) * 100);

    setCompletionPercentage(percentage);
    setStats({
      total: orders.length,
      completed,
      processing,
      pending,
    });
  }, [orders]);

  if (orders.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-sm">
        <CardContent className="p-12 text-center">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Belum ada pesanan</p>
          <p className="text-gray-400 text-sm mt-1">Mulai pesan website Anda sekarang</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Section */}
      <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Progress Pesanan Anda</h2>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Progress Circle */}
            <div className="flex justify-center md:justify-start">
              <ProgressCircle percentage={completionPercentage} />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 w-full">
              <StatsCard
                value={stats.total}
                label="Total Pesanan"
                icon={<Package className="w-5 h-5" />}
                color="bg-blue-50 text-blue-600"
              />
              <StatsCard
                value={stats.completed}
                label="Selesai"
                icon={<CheckCircle2 className="w-5 h-5" />}
                color="bg-green-50 text-green-600"
              />
              <StatsCard
                value={stats.processing}
                label="Diproses"
                icon={<Clock className="w-5 h-5" />}
                color="bg-orange-50 text-orange-600"
              />
              <StatsCard
                value={stats.pending}
                label="Pending"
                icon={<Calendar className="w-5 h-5" />}
                color="bg-red-50 text-red-600"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Timeline */}
      {orders.length > 0 && (
        <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Workflow Pesanan</h2>
            <WorkflowTimeline orders={orders} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
