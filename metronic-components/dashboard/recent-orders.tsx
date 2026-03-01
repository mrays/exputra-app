import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface RecentOrderProps {
  id: string;
  invoiceId: string;
  customer: string;
  email: string;
  amount: number;
  status: 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled';
  date: string;
}

const statusVariants = {
  pending: 'warning',
  paid: 'success',
  processing: 'info',
  completed: 'success',
  cancelled: 'destructive',
} as const;

const statusLabels = {
  pending: 'Menunggu Pembayaran',
  paid: 'Sudah Dibayar',
  processing: 'Diproses',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

interface RecentOrdersProps {
  orders: RecentOrderProps[];
  isLoading?: boolean;
}

export const RecentOrders: React.FC<RecentOrdersProps> = ({ orders, isLoading }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pesanan Terbaru</CardTitle>
        <CardDescription>Pesanan terbaru Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-gray-100" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <p className="text-center text-sm text-gray-500">Belum ada pesanan</p>
          ) : (
            orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{order.customer}</p>
                  <p className="text-xs text-gray-500">{order.invoiceId}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">IDR {order.amount.toLocaleString()}</p>
                  <Badge variant={statusVariants[order.status]}>
                    {statusLabels[order.status]}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentOrders;
