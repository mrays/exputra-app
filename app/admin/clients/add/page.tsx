'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { clientSchema } from '@/lib/validations';
import Button from '@/components/Button';
import { ArrowLeft, Save } from 'lucide-react';

export default function AddClientPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        whatsapp: '',
        company: '',
        address: '',
        status: 'ACTIVE',
        notes: '',
        userId: '',
    });
    const [users, setUsers] = useState<{ id: string, name: string, email: string }[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/admin/users');
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data);
                }
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        };
        fetchUsers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = clientSchema.safeParse(formData);

            if (!result.success) {
                alert(result.error.issues[0].message);
                setLoading(false);
                return;
            }

            const res = await fetch('/api/admin/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push('/admin/clients');
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to create client');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-100">
                <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span>+</span> Tambah Client Data Baru
                </h1>
                <p className="text-gray-500 text-sm mt-1">Tambahkan data client baru ke sistem</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Section */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-700 mb-6 pb-2 border-b">Informasi Client</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Client *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                    placeholder="Nama Lengkap"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Perusahaan (Opsional)</label>
                                <input
                                    type="text"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                    placeholder="Nama Perusahaan"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email *</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password Login (Phone Number) *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                        placeholder="08123456789 (min 6 digit)"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telepon *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                        placeholder="+62..."
                                    />
                                </div>
                                <div />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Alamat *</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">WhatsApp</label>
                                <input
                                    type="text"
                                    value={formData.whatsapp}
                                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                    placeholder="+62812345678"
                                />
                            </div>

                            <div className="pt-4 border-t mt-4">
                                <h3 className="text-md font-semibold text-gray-700 mb-4">Pengaturan Lainnya</h3>

                                <div className="mb-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Link Ke User (Opsional)</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                        value={formData.userId}
                                        onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                                    >
                                        <option value="">Pilih User System</option>
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name} ({user.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status *</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Catatan</label>
                                    <textarea
                                        rows={3}
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none"
                                        placeholder="Informasi tambahan..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 mt-6 border-t">
                            <Link href="/admin/clients">
                                <Button
                                    variant="secondary"
                                    size="md"
                                    icon={<ArrowLeft className="w-4 h-4" />}
                                >
                                    Kembali
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                variant="primary"
                                size="md"
                                isLoading={loading}
                                icon={<Save className="w-4 h-4" />}
                            >
                                {loading ? 'Menyimpan...' : 'Simpan Client'}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Sidebar Guide */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 sticky top-24">
                        <h3 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span>?</span> Bantuan
                        </h3>

                        <div className="space-y-4 text-sm text-gray-600">
                            <div>
                                <strong className="block text-gray-800 mb-1">Informasi Client:</strong>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li><b>Nama Client:</b> Nama lengkap perusahaan/individu</li>
                                    <li><b>Alamat:</b> Alamat lengkap client untuk invoicing</li>
                                    <li><b>WhatsApp:</b> Nomor WA dengan kode negara (+62)</li>
                                </ul>
                            </div>

                            <hr className="border-gray-100" />

                            <div>
                                <strong className="block text-gray-800 mb-1">Status:</strong>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li><span className="text-green-600 font-bold">ACTIVE</span>: Layanan berjalan normal</li>
                                    <li><span className="text-red-600 font-bold">INACTIVE</span>: Client non-aktif</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
