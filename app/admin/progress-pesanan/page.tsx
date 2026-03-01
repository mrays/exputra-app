'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, X, Eye, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import ProjectCard from '@/components/admin/ProjectCard';
import ProjectDetail from '@/components/admin/ProjectDetail';

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

const statusConfig: Record<string, { bg: string; text: string; label: string; color: string }> = {
  PENDING: { bg: 'bg-red-50', text: 'text-red-700', label: 'Menunggu Pembayaran', color: 'red' },
  PAID: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Pembayaran Diterima', color: 'yellow' },
  PROCESSING: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Sedang Diproses', color: 'blue' },
  COMPLETED: { bg: 'bg-green-50', text: 'text-green-700', label: 'Selesai', color: 'green' },
  CANCELLED: { bg: 'bg-gray-50', text: 'text-gray-700', label: 'Dibatalkan', color: 'gray' },
};

export default function ProgressPesananPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        const sortedData = data.sort((a: Order, b: Order) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sortedData);
        setFilteredOrders(sortedData);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = orders;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(order =>
        order.domainName.toLowerCase().includes(q) ||
        order.invoiceId.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q)
      );
    }

    if (statusFilter) {
      result = result.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(result);
  }, [searchQuery, statusFilter, orders]);

  const getProgressPercentage = (status: string) => {
    const progressMap: Record<string, number> = {
      PENDING: 15,
      PAID: 40,
      PROCESSING: 75,
      COMPLETED: 100,
      CANCELLED: 0,
    };
    return progressMap[status] || 0;
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    paid: orders.filter(o => o.status === 'PAID').length,
    processing: orders.filter(o => o.status === 'PROCESSING').length,
    completed: orders.filter(o => o.status === 'COMPLETED').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-600" />
              Progress Pesanan
            </h1>
            <p className="text-gray-600 mt-2">Pantau progress pengerjaan semua pesanan website</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-600">
          <p className="text-sm text-gray-600">Total Pesanan</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-600">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-600">
          <p className="text-sm text-gray-600">Dibayar</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.paid}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-600">
          <p className="text-sm text-gray-600">Diproses</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{stats.processing}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-600">
          <p className="text-sm text-gray-600">Selesai</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{stats.completed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 space-y-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama domain, invoice, atau customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Status</option>
              <option value="PENDING">Menunggu Pembayaran</option>
              <option value="PAID">Pembayaran Diterima</option>
              <option value="PROCESSING">Sedang Diproses</option>
              <option value="COMPLETED">Selesai</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>

            {(searchQuery || statusFilter) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('');
                }}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Reset
              </button>
            )}
          </div>

          {/* Projects List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project Cards */}
            <div className="lg:col-span-1 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Tidak ada pesanan yang ditemukan</p>
                </div>
              ) : (
                filteredOrders.map(order => (
                  <ProjectCard
                    key={order.id}
                    order={order}
                    isSelected={selectedOrder?.id === order.id}
                    onSelect={setSelectedOrder}
                    progress={getProgressPercentage(order.status)}
                    statusConfig={statusConfig[order.status]}
                  />
                ))
              )}
            </div>

            {/* Project Detail */}
            <div className="lg:col-span-2">
              {selectedOrder ? (
                <ProjectDetail
                  order={selectedOrder}
                  statusConfig={statusConfig[selectedOrder.status]}
                  progress={getProgressPercentage(selectedOrder.status)}
                  onClose={() => setSelectedOrder(null)}
                />
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center h-[600px] flex items-center justify-center">
                  <div>
                    <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Pilih pesanan untuk melihat detail</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
