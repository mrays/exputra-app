'use client';

import { Clock, MapPin } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Order {
  id: string;
  invoiceId: string;
  domainName: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  createdAt: string;
  paidAt?: string;
  notes?: string;
  domain?: { extension: string };
  template?: { name: string };
  package?: { name: string; duration: number };
  websiteUsername?: string;
  websitePassword?: string;
  loginUrl?: string;
  websiteEmail?: string;
}

interface StatusConfig {
  bg: string;
  text: string;
  label: string;
  color: string;
}

interface ProjectCardProps {
  order: Order;
  isSelected: boolean;
  onSelect: (order: Order) => void;
  progress: number;
  statusConfig: StatusConfig;
}

export default function ProjectCard({
  order,
  isSelected,
  onSelect,
  progress,
  statusConfig,
}: ProjectCardProps) {
  return (
    <div
      onClick={() => onSelect(order)}
      className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 ${
        isSelected
          ? 'border-blue-600 bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{order.domainName}</h3>
          <p className="text-xs text-gray-500">{order.invoiceId}</p>
        </div>
        <span
          className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${statusConfig.bg} ${statusConfig.text}`}
        >
          {statusConfig.label}
        </span>
      </div>

      {/* Customer */}
      <div className="mb-3 text-sm text-gray-600">
        <p className="font-medium text-gray-900">{order.customerName}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-600">Progress</span>
          <span className="text-xs font-bold text-gray-900">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 bg-${statusConfig.color}-500`}
            style={{
              width: `${progress}%`,
              backgroundColor: statusConfig.color === 'red' ? '#ef4444' : 
                               statusConfig.color === 'yellow' ? '#eab308' :
                               statusConfig.color === 'blue' ? '#3b82f6' :
                               statusConfig.color === 'green' ? '#22c55e' : '#6b7280'
            }}
          />
        </div>
      </div>

      {/* Date */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: id })}</span>
        </div>
        <span>{format(new Date(order.createdAt), 'd MMM yyyy', { locale: id })}</span>
      </div>
    </div>
  );
}
