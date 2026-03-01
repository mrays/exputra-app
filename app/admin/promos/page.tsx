'use client';

import { useEffect, useState } from 'react';
import { Gift, Plus, Edit, Trash2, X, Search, Save } from 'lucide-react';
import Button from '@/components/Button';

interface Promo {
  id: string;
  code: string;
  discountType: 'PERCENT' | 'NOMINAL';
  discountValue: number;
  minTransaction: number;
  maxDiscount: number | null;
  expiredAt: string | null;
  isActive: boolean;
}

export default function PromosPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENT' as 'PERCENT' | 'NOMINAL',
    discountValue: 0,
    minTransaction: 0,
    maxDiscount: '',
    expiredAt: '',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      const res = await fetch('/api/admin/promos');
      if (res.ok) {
        const data = await res.json();
        setPromos(data);
      }
    } catch (error) {
      console.error('Failed to fetch promos:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (promo?: Promo) => {
    if (promo) {
      setEditingPromo(promo);
      setFormData({
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        minTransaction: promo.minTransaction,
        maxDiscount: promo.maxDiscount?.toString() || '',
        expiredAt: promo.expiredAt ? promo.expiredAt.split('T')[0] : '',
        isActive: promo.isActive,
      });
    } else {
      setEditingPromo(null);
      setFormData({
        code: '',
        discountType: 'PERCENT',
        discountValue: 0,
        minTransaction: 0,
        maxDiscount: '',
        expiredAt: '',
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPromo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingPromo
        ? `/api/admin/promos/${editingPromo.id}`
        : '/api/admin/promos';
      const method = editingPromo ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          maxDiscount: formData.maxDiscount ? parseInt(formData.maxDiscount) : null,
          expiredAt: formData.expiredAt ? new Date(formData.expiredAt).toISOString() : null,
        }),
      });

      if (res.ok) {
        fetchPromos();
        closeModal();
      } else {
        const error = await res.json();
        alert(error.message || 'Gagal menyimpan promo');
      }
    } catch (error) {
      console.error('Failed to save promo:', error);
      alert('Gagal menyimpan promo');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus promo ini?')) return;

    try {
      const res = await fetch(`/api/admin/promos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPromos();
      } else {
        alert('Gagal menghapus promo');
      }
    } catch (error) {
      console.error('Failed to delete promo:', error);
    }
  };

  const toggleStatus = async (promo: Promo) => {
    try {
      await fetch(`/api/admin/promos/${promo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...promo, isActive: !promo.isActive }),
      });
      fetchPromos();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const isExpired = (date: string | null) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Gift className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Promos</h1>
            <p className="text-gray-600 mt-1">Kelola kode promo dan diskon</p>
          </div>
        </div>
        <Button
          onClick={() => openModal()}
          variant="primary"
          size="md"
          icon={<Plus className="w-5 h-5" />}
        >
          Tambah Promo
        </Button>
      </div>

      {/* Promos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promos.map((promo) => (
          <div
            key={promo.id}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all"
          >
            {/* Code Badge */}
            <div className="mb-4">
              <span className="inline-block font-mono font-bold text-white bg-blue-600 px-3 py-1 rounded-lg text-sm">
                {promo.code}
              </span>
              <span className={`ml-2 inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                promo.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {promo.isActive ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>

            {/* Discount Info */}
            <div className="mb-4 pb-4 border-b border-gray-200 space-y-2">
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Diskon</p>
                <p className="text-2xl font-bold text-blue-600">
                  {promo.discountType === 'PERCENT'
                    ? `${promo.discountValue}%`
                    : `IDR ${promo.discountValue.toLocaleString('id-ID')}`}
                </p>
              </div>
              {promo.maxDiscount && (
                <p className="text-xs text-gray-500">
                  Max: IDR {promo.maxDiscount.toLocaleString('id-ID')}
                </p>
              )}
            </div>

            {/* Details */}
            <div className="mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Min. Transaksi:</span>
                <span className="font-semibold text-gray-900">IDR {promo.minTransaction.toLocaleString('id-ID')}</span>
              </div>
              {promo.expiredAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Expired:</span>
                  <span className={`font-semibold ${isExpired(promo.expiredAt) ? 'text-red-600' : 'text-gray-900'}`}>
                    {new Date(promo.expiredAt).toLocaleDateString('id-ID')}
                    {isExpired(promo.expiredAt) && <span className="ml-1 text-red-600">(Expired)</span>}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={() => openModal(promo)}
                variant="secondary"
                size="sm"
                icon={<Edit className="w-4 h-4" />}
                fullWidth
              >
                Edit
              </Button>
              <Button
                onClick={() => handleDelete(promo.id)}
                variant="danger"
                size="sm"
                icon={<Trash2 className="w-4 h-4" />}
                fullWidth
              >
                Hapus
              </Button>
            </div>
          </div>
        ))}
      </div>

      {promos.length === 0 && (
        <div className="text-center py-12">
          <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Belum ada promo. Klik &quot;Tambah Promo&quot; untuk menambahkan.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 overflow-hidden shadow-xl">
            {/* Sticky Header */}
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Gift className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingPromo ? 'Edit Promo' : 'Tambah Promo'}
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
                  Kode Promo
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="DISKON10"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Tipe Diskon
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'PERCENT' | 'NOMINAL' })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="PERCENT">Persentase (%)</option>
                    <option value="NOMINAL">Nominal (IDR)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Nilai Diskon
                  </label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Min. Transaksi (IDR)
                  </label>
                  <input
                    type="number"
                    value={formData.minTransaction}
                    onChange={(e) => setFormData({ ...formData, minTransaction: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Max. Diskon (IDR)
                  </label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    placeholder="Kosongkan jika tidak ada"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Tanggal Expired
                </label>
                <input
                  type="date"
                  value={formData.expiredAt}
                  onChange={(e) => setFormData({ ...formData, expiredAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
