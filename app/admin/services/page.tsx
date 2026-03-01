'use client';

import { useEffect, useState } from 'react';
import { Wrench, Plus, Search, Edit, Trash2, X, Save } from 'lucide-react';
import Button from '@/components/Button';

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  priceType: 'ONE_TIME' | 'PER_YEAR' | 'MONTHLY';
  isActive: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    priceType: 'ONE_TIME' as 'ONE_TIME' | 'PER_YEAR' | 'MONTHLY',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFilteredServices(services.filter(s =>
      s.name.toLowerCase().includes(q) ||
      (s.description?.toLowerCase() || '').includes(q)
    ));
  }, [services, search]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/services');
      if (res.ok) {
        const data = await res.json();
        setServices(data);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description || '',
        price: service.price,
        priceType: service.priceType,
        isActive: service.isActive,
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        priceType: 'ONE_TIME',
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingService(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingService ? `/api/admin/services/${editingService.id}` : '/api/admin/services';
      const method = editingService ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchServices();
        closeModal();
      } else {
        const err = await res.json();
        alert(err.message || 'Error occurred');
      }
    } catch (error) {
      alert('Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchServices();
      } else {
        const err = await res.json();
        alert(err.message || 'Gagal menghapus jasa. Pastikan jasa tidak sedang digunakan dalam pesanan.');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Terjadi kesalahan koneksi saat menghapus jasa.');
    }
  };

  const toggleStatus = async (service: Service) => {
    try {
      await fetch(`/api/admin/services/${service.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...service, isActive: !service.isActive }),
      });
      fetchServices();
    } catch (error) {
      console.error('Toggle failed:', error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Wrench className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Layanan Tambahan</h1>
            <p className="text-gray-600 mt-1">Kelola layanan dan fitur tambahan</p>
          </div>
        </div>
        <Button
          onClick={() => openModal()}
          variant="primary"
          size="md"
          icon={<Plus className="w-5 h-5" />}
        >
          Tambah Layanan
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari layanan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            <div className="inline-flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              Loading...
            </div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada layanan. Klik &quot;Tambah Layanan&quot; untuk menambahkan.</p>
          </div>
        ) : (
          filteredServices.map(service => (
            <div
              key={service.id}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all"
            >
              {/* Header */}
              <div className="mb-4">
                <h3 className="font-bold text-gray-900">{service.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">{service.description || 'No description'}</p>
              </div>

              {/* Price and Type */}
              <div className="mb-4 pb-4 border-b border-gray-200 space-y-2">
                <p className="text-2xl font-bold text-blue-600">IDR {service.price.toLocaleString('id-ID')}</p>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                  service.priceType === 'PER_YEAR' ? 'bg-indigo-100 text-indigo-700' : service.priceType === 'MONTHLY' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {service.priceType === 'ONE_TIME' && 'Sekali Bayar'}
                  {service.priceType === 'PER_YEAR' && 'Per Tahun'}
                  {service.priceType === 'MONTHLY' && 'Bulanan'}
                </span>
              </div>

              {/* Status and Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => openModal(service)}
                  variant="secondary"
                  size="sm"
                  icon={<Edit className="w-4 h-4" />}
                  fullWidth
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(service.id)}
                  variant="danger"
                  size="sm"
                  icon={<Trash2 className="w-4 h-4" />}
                  fullWidth
                >
                  Hapus
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-xl">
            {/* Sticky Header */}
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Wrench className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingService ? 'Edit Layanan' : 'Tambah Layanan'}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Nama Layanan
                </label>
                <input
                  type="text" required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. SEO Optimization"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Deskripsi
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detail layanan..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Harga (IDR)
                  </label>
                  <input
                    type="number" required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Tipe Pembayaran
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.priceType}
                    onChange={(e) => setFormData({ ...formData, priceType: e.target.value as any })}
                  >
                    <option value="ONE_TIME">Sekali Bayar</option>
                    <option value="PER_YEAR">Per Tahun</option>
                    <option value="MONTHLY">Bulanan</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox" id="isActive"
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label htmlFor="isActive" className="ml-2 text-sm font-semibold text-gray-900">
                  Aktif
                </label>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  onClick={closeModal}
                  variant="secondary"
                  size="md"
                  fullWidth
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  variant="primary"
                  size="md"
                  isLoading={saving}
                  icon={!saving && <Save className="w-4 h-4" />}
                  fullWidth
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
