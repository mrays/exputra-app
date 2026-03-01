'use client';

import { DollarSign, Calendar, CheckCircle2, AlertCircle, Zap, Users } from 'lucide-react';

interface OrderPaymentInfo {
  id: string;
  invoiceId: string;
  domainName: string;
  total: number;
  status: string;
  createdAt: string;
  package?: {
    name?: string;
    duration: number;
  } | null;
  domain?: {
    extension: string;
  };
}

interface PaymentInfoCardProps {
  order: OrderPaymentInfo;
}

const statusColors: Record<string, { bg: string; text: string; badge: string }> = {
  PENDING: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    badge: 'bg-orange-100 text-orange-700'
  },
  PAID: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700'
  },
  PROCESSING: {
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    badge: 'bg-cyan-100 text-cyan-700'
  },
  COMPLETED: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-700'
  },
  CANCELLED: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-700'
  },
};

const statusLabels: Record<string, string> = {
  PENDING: 'Menunggu Pembayaran',
  PAID: 'Pembayaran Diterima',
  PROCESSING: 'Sedang Diproses',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
};

const getProgressInfo = (status: string) => {
  const progressMap: Record<string, { percent: number; step: string }> = {
    PENDING: { percent: 20, step: '1 dari 4' },
    PAID: { percent: 40, step: '2 dari 4' },
    PROCESSING: { percent: 70, step: '3 dari 4' },
    COMPLETED: { percent: 100, step: '4 dari 4' },
    CANCELLED: { percent: 0, step: 'Dibatalkan' },
  };
  return progressMap[status] || { percent: 0, step: 'Tidak Diketahui' };
};

export default function PaymentInfoCard({ order }: PaymentInfoCardProps) {
  const colors = statusColors[order.status];
  const progress = getProgressInfo(order.status);
  const createdDate = new Date(order.createdAt);
  const expiryDate = new Date(order.createdAt);
  expiryDate.setFullYear(expiryDate.getFullYear() + (order.package?.duration || 1));

  return (
    <div className={`${colors.bg} rounded-xl border-2 ${colors.badge.split(' ')[0]} p-6 mb-6`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {order.domainName}{order.domain?.extension}
          </h2>
          <p className={`text-sm mt-1 ${colors.text}`}>
            {statusLabels[order.status]}
          </p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${colors.badge}`}>
          #{order.invoiceId}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Total Payment */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className={`w-4 h-4 ${colors.text}`} />
            <span className="text-xs font-semibold text-gray-600 uppercase">Total Bayar</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            IDR {order.total.toLocaleString()}
          </p>
        </div>

        {/* Package */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className={`w-4 h-4 ${colors.text}`} />
            <span className="text-xs font-semibold text-gray-600 uppercase">Paket</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {order.package?.duration || 1}
          </p>
          <p className="text-xs text-gray-600 mt-1">Tahun</p>
        </div>

        {/* Order Date */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className={`w-4 h-4 ${colors.text}`} />
            <span className="text-xs font-semibold text-gray-600 uppercase">Tanggal Order</span>
          </div>
          <p className="text-sm font-bold text-gray-900">
            {createdDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {createdDate.toLocaleDateString('id-ID', { year: 'numeric' })}
          </p>
        </div>

        {/* Expiry Date */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className={`w-4 h-4 ${colors.text}`} />
            <span className="text-xs font-semibold text-gray-600 uppercase">Berlaku Hingga</span>
          </div>
          <p className="text-sm font-bold text-gray-900">
            {expiryDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {expiryDate.toLocaleDateString('id-ID', { year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600" />
            Progress Pemrosesan
          </span>
          <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            {progress.step}
          </span>
        </div>

        {/* Progress Steps */}
        <div className="mb-4 overflow-x-auto -mx-4 px-4 md:overflow-visible md:mx-0 md:px-0">
          <div className="flex items-center justify-between gap-1 md:gap-4 min-w-max md:min-w-0">
            {/* Step 1 */}
            <div className="flex-shrink-0 md:flex-1 text-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1 font-bold text-xs ${
                ['PENDING', 'PAID', 'PROCESSING', 'COMPLETED'].includes(order.status)
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <p className="text-xs text-gray-600 font-medium whitespace-nowrap">Verifikasi</p>
            </div>

            {/* Connector 1-2 */}
            <div className={`w-6 md:flex-1 h-1 ${
              ['PAID', 'PROCESSING', 'COMPLETED'].includes(order.status)
                ? 'bg-blue-500'
                : 'bg-gray-200'
            }`}></div>

            {/* Step 2 */}
            <div className="flex-shrink-0 md:flex-1 text-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1 font-bold text-xs ${
                ['PAID', 'PROCESSING', 'COMPLETED'].includes(order.status)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <p className="text-xs text-gray-600 font-medium whitespace-nowrap">Pembayaran</p>
            </div>

            {/* Connector 2-3 */}
            <div className={`w-6 md:flex-1 h-1 ${
              ['PROCESSING', 'COMPLETED'].includes(order.status)
                ? 'bg-cyan-500'
                : 'bg-gray-200'
            }`}></div>

            {/* Step 3 */}
            <div className="flex-shrink-0 md:flex-1 text-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1 font-bold text-xs ${
                ['PROCESSING', 'COMPLETED'].includes(order.status)
                  ? 'bg-cyan-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
              <p className="text-xs text-gray-600 font-medium whitespace-nowrap">Pemrosesan</p>
            </div>

            {/* Connector 3-4 */}
            <div className={`w-6 md:flex-1 h-1 ${
              ['COMPLETED'].includes(order.status)
                ? 'bg-green-500'
                : 'bg-gray-200'
            }`}></div>

            {/* Step 4 */}
            <div className="flex-shrink-0 md:flex-1 text-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1 font-bold text-xs ${
                ['COMPLETED'].includes(order.status)
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                4
              </div>
              <p className="text-xs text-gray-600 font-medium whitespace-nowrap">Selesai</p>
            </div>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              order.status === 'COMPLETED' ? 'bg-gradient-to-r from-green-500 to-green-600 w-full' :
              order.status === 'PROCESSING' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 w-2/3' :
              order.status === 'PAID' ? 'bg-gradient-to-r from-blue-500 to-blue-600 w-1/2' :
              order.status === 'CANCELLED' ? 'bg-gray-400 w-0' :
              'bg-gradient-to-r from-orange-500 to-orange-600 w-1/4'
            }`}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {order.status === 'COMPLETED' && 'Pesanan Anda sudah selesai dan siap digunakan!'}
          {order.status === 'PROCESSING' && 'Tim kami sedang mengerjakan pesanan Anda...'}
          {order.status === 'PAID' && 'Pembayaran diterima, pesanan akan segera diproses'}
          {order.status === 'PENDING' && 'Silakan selesaikan pembayaran untuk melanjutkan'}
          {order.status === 'CANCELLED' && 'Pesanan telah dibatalkan'}
        </p>
      </div>
    </div>
  );
}
