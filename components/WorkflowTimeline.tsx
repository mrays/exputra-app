'use client';

import { CheckCircle2, Clock, AlertCircle, Zap } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  domainName: string;
  createdAt: string;
}

interface WorkflowTimelineProps {
  orders: Order[];
}

const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  PENDING: {
    icon: <AlertCircle className="w-5 h-5" />,
    color: 'text-red-600 bg-red-50',
    label: 'Menunggu Pembayaran',
  },
  PAID: {
    icon: <Clock className="w-5 h-5" />,
    color: 'text-yellow-600 bg-yellow-50',
    label: 'Pembayaran Diterima',
  },
  PROCESSING: {
    icon: <Zap className="w-5 h-5" />,
    color: 'text-blue-600 bg-blue-50',
    label: 'Sedang Diproses',
  },
  COMPLETED: {
    icon: <CheckCircle2 className="w-5 h-5" />,
    color: 'text-green-600 bg-green-50',
    label: 'Selesai',
  },
  CANCELLED: {
    icon: <AlertCircle className="w-5 h-5" />,
    color: 'text-gray-600 bg-gray-50',
    label: 'Dibatalkan',
  },
};

const statusOrder = ['PENDING', 'PAID', 'PROCESSING', 'COMPLETED'];

export default function WorkflowTimeline({ orders }: WorkflowTimelineProps) {
  const getLatestOrderStatus = () => {
    if (orders.length === 0) return null;
    const sortedOrders = [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return sortedOrders[0];
  };

  const latestOrder = getLatestOrderStatus();

  if (!latestOrder) return null;

  const currentStatusIndex = statusOrder.indexOf(latestOrder.status);

  return (
    <div className="space-y-4">
      {/* Mini Workflow Steps */}
      <div className="flex gap-2 md:gap-4 overflow-x-auto pb-4">
        {statusOrder.map((status, index) => {
          const config = statusConfig[status];
          const isCompleted = index < currentStatusIndex;
          const isCurrent = index === currentStatusIndex;
          const isNext = index > currentStatusIndex;

          return (
            <div key={status} className="flex flex-col items-center flex-shrink-0">
              {/* Step Circle */}
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full mb-2 transition-all ${
                  isCompleted || isCurrent
                    ? config.color
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {config.icon}
              </div>
              {/* Step Label */}
              <p className={`text-xs font-medium text-center max-w-[70px] ${
                isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {config.label.split(' ')[0]}
              </p>
              {/* Connector Line */}
              {index < statusOrder.length - 1 && (
                <div className={`h-1 w-8 mt-2 ${
                  isCompleted ? 'bg-green-400' : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Latest Order Info */}
      <div className="bg-blue-50 rounded-lg p-4 mt-6">
        <p className="text-sm text-gray-600 mb-1">Pesanan Terbaru:</p>
        <p className="font-semibold text-gray-900">{latestOrder.domainName}</p>
        <p className="text-xs text-gray-500 mt-2">
          Status: <span className={statusConfig[latestOrder.status].color.split(' ')[1]}>{statusConfig[latestOrder.status].label}</span>
        </p>
      </div>
    </div>
  );
}
