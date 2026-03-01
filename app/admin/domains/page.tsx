'use client';

import { useEffect, useState } from 'react';
import { Globe, Search, Plus, Trash2, Edit, X } from 'lucide-react';
import Button from '@/components/Button';

interface Domain {
  id: string;
  extension: string;
  price: number;
  isActive: boolean;
  label: string | null;
}

export default function DomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    extension: '',
    price: 0,
    isActive: true,
    label: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      const res = await fetch('/api/admin/domains');
      if (res.ok) {
        const data = await res.json();
        setDomains(data);
      }
    } catch (error) {
      console.error('Failed to fetch domains:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (domain?: Domain) => {
    if (domain) {
      setEditingDomain(domain);
      setFormData({
        extension: domain.extension,
        price: domain.price,
        isActive: domain.isActive,
        label: domain.label || '',
      });
    } else {
      setEditingDomain(null);
      setFormData({ extension: '', price: 0, isActive: true, label: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDomain(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingDomain
        ? `/api/admin/domains/${editingDomain.id}`
        : '/api/admin/domains';
      const method = editingDomain ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          label: formData.label || null,
        }),
      });

      if (res.ok) {
        fetchDomains();
        closeModal();
      } else {
        const error = await res.json();
        alert(error.message || 'Gagal menyimpan domain');
      }
    } catch (error) {
      console.error('Failed to save domain:', error);
      alert('Gagal menyimpan domain');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus domain ini?')) return;

    try {
      const res = await fetch(`/api/admin/domains/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchDomains();
      } else {
        alert('Gagal menghapus domain');
      }
    } catch (error) {
      console.error('Failed to delete domain:', error);
    }
  };

  const toggleStatus = async (domain: Domain) => {
    try {
      await fetch(`/api/admin/domains/${domain.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...domain, isActive: !domain.isActive }),
      });
      fetchDomains();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredDomains = domains.filter(d => 
    d.extension.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Globe className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Domain Extensions</h1>
            <p className="text-gray-600 mt-1">Kelola ekstensi domain dan harga</p>
          </div>
        </div>
        <Button
          onClick={() => openModal()}
          variant="primary"
          icon={<Plus className="w-5 h-5" />}
        >
          Tambah Domain
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari extension..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Domains Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDomains.map((domain) => (
          <div
            key={domain.id}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all"
          >
            {/* Header with label */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{domain.extension}</h3>
                {domain.label && (
                  <span className={`inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full ${
                    domain.label === 'POPULAR' ? 'bg-blue-100 text-blue-700' :
                    domain.label === 'BEST_SELLER' ? 'bg-green-100 text-green-700' :
                    'bg-pink-100 text-pink-700'
                  }`}>
                    {domain.label.replace('_', ' ')}
                  </span>
                )}
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                domain.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {domain.isActive ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>

            {/* Price */}
            <div className="mb-4 pb-4 border-b border-gray-200">
              <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Harga per Tahun</p>
              <p className="text-2xl font-bold text-blue-600">
                IDR {domain.price.toLocaleString('id-ID')}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={() => openModal(domain)}
                variant="secondary"
                size="md"
                icon={<Edit className="w-4 h-4" />}
                fullWidth
              >
                Edit
              </Button>
              <Button
                onClick={() => handleDelete(domain.id)}
                variant="danger"
                size="md"
                icon={<Trash2 className="w-4 h-4" />}
                fullWidth
              >
                Hapus
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredDomains.length === 0 && (
        <div className="text-center py-12">
          <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Belum ada domain. Klik &quot;Tambah Domain&quot; untuk menambahkan.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 overflow-hidden shadow-xl">
            {/* Sticky Header */}
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingDomain ? 'Edit Domain' : 'Tambah Domain'}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Extension
                </label>
                <input
                  type="text"
                  value={formData.extension}
                  onChange={(e) => setFormData({ ...formData, extension: e.target.value })}
                  placeholder=".com"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Harga per Tahun (IDR)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Label
                </label>
                <select
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tidak ada</option>
                  <option value="POPULAR">Popular</option>
                  <option value="BEST_SELLER">Best Seller</option>
                  <option value="PROMO">Promo</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
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
                  variant="primary"
                  size="md"
                  isLoading={saving}
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
