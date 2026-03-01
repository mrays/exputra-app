'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Plus, Edit, Trash2, X } from 'lucide-react';
import Button from '@/components/Button';
import DataExportImport from '@/components/DataExportImport';

interface DomainRegistrar {
    id: string;
    name: string;
    username?: string;
    password?: string;
    loginUrl?: string;
    expiredAt?: string;
    notes?: string;
    isActive: boolean;
    _count?: {
        domains: number;
    };
}

export default function DomainRegistrarsPage() {
    const [registrars, setRegistrars] = useState<DomainRegistrar[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<DomainRegistrar | null>(null);

    useEffect(() => {
        fetchRegistrars();
    }, []);

    const fetchRegistrars = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/domain-registrars');
            const data = await res.json();
            setRegistrars(data);
        } catch (error) {
            console.error('Failed to fetch registrars', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this registrar?')) return;
        try {
            await fetch(`/api/admin/domain-registrars/${id}`, { method: 'DELETE' });
            fetchRegistrars();
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const handleImportRegistrars = async (importedData: any[]) => {
        try {
            const response = await fetch('/api/admin/domain-registrars/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: importedData }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Gagal mengimpor data');
            }

            // Show success with details
            alert(`✓ ${result.message}`);
            
            fetchRegistrars();
        } catch (error) {
            throw error;
        }
    };

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                        <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Domain Registrars</h1>
                        <p className="text-gray-600 mt-1">Kelola akun dan kredensial registrar domain</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <DataExportImport
                        data={registrars}
                        fileName="domain_registrars"
                        sheetName="Registrars"
                        columns={['name', 'username', 'loginUrl', 'expiredAt', 'notes', 'isActive']}
                        onImport={handleImportRegistrars}
                    />
                    <Button
                        onClick={() => { setEditing(null); setShowModal(true); }}
                        variant="primary"
                        icon={<Plus className="w-5 h-5" />}
                    >
                        Tambah Registrar
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Nama Provider</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Domain Terkait</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Berakhir</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500"><div className="inline-flex items-center justify-center gap-2"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>Loading...</div></td></tr>
                        ) : registrars.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">Belum ada registrar</td></tr>
                        ) : (
                            registrars.map((reg) => (
                                <tr key={reg.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{reg.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{reg.username || '-'}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{reg._count?.domains || 0}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {reg.expiredAt ? new Date(reg.expiredAt).toLocaleDateString('id-ID') : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${reg.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {reg.isActive ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm flex gap-2">
                                        <Button onClick={() => { setEditing(reg); setShowModal(true); }} variant="ghost" size="sm" icon={<Edit className="w-4 h-4" />}>Edit</Button>
                                        <Button onClick={() => handleDelete(reg.id)} variant="ghost" size="sm" icon={<Trash2 className="w-4 h-4" />} className="text-red-600 hover:text-red-700">Hapus</Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <RegistrarModal
                    registrar={editing}
                    onClose={() => { setShowModal(false); setEditing(null); }}
                    onSuccess={() => { setShowModal(false); setEditing(null); fetchRegistrars(); }}
                />
            )}
        </div>
    );
}

function RegistrarModal({ registrar, onClose, onSuccess }: { registrar: DomainRegistrar | null; onClose: () => void; onSuccess: () => void; }) {
    const [formData, setFormData] = useState({
        name: registrar?.name || '',
        username: registrar?.username || '',
        password: registrar?.password || '',
        loginUrl: registrar?.loginUrl || '',
        expiredAt: registrar?.expiredAt ? registrar.expiredAt.split('T')[0] : '',
        notes: registrar?.notes || '',
        isActive: registrar ? registrar.isActive : true,
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = registrar ? `/api/admin/domain-registrars/${registrar.id}` : '/api/admin/domain-registrars';
            const method = registrar ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    expiredAt: formData.expiredAt || null,
                }),
            });

            if (res.ok) onSuccess();
            else alert((await res.json()).message || 'Gagal menyimpan');
        } catch (error) {
            alert('Terjadi kesalahan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">{registrar ? 'Edit Registrar' : 'Tambah Registrar'}</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Nama Registrar *</label>
                        <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g. GoDaddy, Namecheap" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Username</label>
                            <input value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Kosongkan jika tidak berubah"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2 text-blue-600 text-xs font-semibold">{showPassword ? 'Sembunyikan' : 'Tampilkan'}</button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Login URL</label>
                        <input type="url" value={formData.loginUrl} onChange={e => setFormData({ ...formData, loginUrl: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="https://..." />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Tanggal Berakhir</label>
                            <input type="date" value={formData.expiredAt} onChange={e => setFormData({ ...formData, expiredAt: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Status</label>
                            <select
                                value={formData.isActive ? 'true' : 'false'}
                                onChange={e => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="true">Aktif</option>
                                <option value="false">Nonaktif</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Catatan</label>
                        <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <Button type="button" onClick={onClose} variant="secondary" size="md" fullWidth>Batal</Button>
                        <Button type="submit" variant="primary" size="md" isLoading={loading} fullWidth>{loading ? 'Menyimpan...' : 'Simpan'}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
