'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/Button';
import { ArrowLeft, Save } from 'lucide-react';

export default function AddServerPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<any[]>([]);

    // Form Data
    const [formData, setFormData] = useState({
        clientEmail: '',
        serverName: '',
        ipAddress: '',
        username: '',
        password: '',
        loginUrl: '',
        expiredAt: '',
        status: 'ACTIVE',
        serverType: 'VPS',
        location: '',
        notes: '',
    });

    useEffect(() => {
        // Fetch clients for dropdown
        fetch('/api/admin/clients').then(res => res.json()).then(data => setClients(data));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/admin/client-servers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push('/admin/client-servers');
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to create server');
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
            <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-100">
                <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span>+</span> Tambah Server Baru
                </h1>
                <p className="text-gray-500 text-sm mt-1">Tambahkan server hosting baru ke sistem</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-700 mb-6 pb-2 border-b">Informasi Server</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pilih Client *</label>
                                <select
                                    required
                                    value={formData.clientEmail}
                                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                >
                                    <option value="">-- Pilih Client Pemilik --</option>
                                    {clients.map((client: any) => (
                                        <option key={client.email} value={client.email}>{client.name} ({client.company || client.email})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Server *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.serverName}
                                    onChange={(e) => setFormData({ ...formData, serverName: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                    placeholder="Server Hosting 1"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">IP Address *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.ipAddress}
                                    onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-mono"
                                    placeholder="192.168.1.100"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Lokasi Server *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                    placeholder="Jakarta, SG, US..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Username (Opsional)</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                    placeholder="root"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password (Opsional)</label>
                                <div className="flex">
                                    <input
                                        type="text" // Show as text for easier admin viewing initially or password? SS shows text input style but maybe hidden? Let's use text as admin usually generates it.
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                        placeholder="Hidden/Encrypted later"
                                    />
                                    <button type="button" className="px-3 border border-l-0 border-gray-200 bg-gray-50 rounded-r-lg hover:bg-gray-100">
                                        👁️
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Password akan dienkripsi secara otomatis</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Login Link (Opsional)</label>
                                <input
                                    type="text"
                                    value={formData.loginUrl}
                                    onChange={(e) => setFormData({ ...formData, loginUrl: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                    placeholder="https://server1.example.com:2083"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Jenis Server</label>
                                    <select
                                        value={formData.serverType}
                                        onChange={(e) => setFormData({ ...formData, serverType: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                    >
                                        <option value="VPS">VPS</option>
                                        <option value="SHARED">Shared Hosting</option>
                                        <option value="DEDICATED">Dedicated Server</option>
                                        <option value="CLOUD">Cloud Server</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                        <option value="MAINTENANCE">Maintenance</option>
                                    </select>
                                </div>
                            </div>


                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tanggal Expired</label>
                                <input
                                    type="date"
                                    value={formData.expiredAt}
                                    onChange={(e) => setFormData({ ...formData, expiredAt: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Catatan</label>
                                <textarea
                                    rows={3}
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none"
                                    placeholder="Informasi tambahan tentang server"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 mt-6 border-t">
                            <Link href="/admin/client-servers">
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
                                {loading ? 'Menyimpan...' : 'Simpan Server'}
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 sticky top-24">
                        <h3 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2">
                            ? Bantuan
                        </h3>

                        <div className="space-y-4 text-sm text-gray-600">
                            <div>
                                <strong className="block text-gray-800 mb-1">Informasi Server:</strong>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li><b>Nama Server:</b> Nama identifikasi server</li>
                                    <li><b>IP Address:</b> Alamat IP server</li>
                                    <li><b>Username:</b> Username untuk SSH/Panel</li>
                                    <li><b>Password:</b> Password (akan dienkripsi)</li>
                                    <li><b>Login Link:</b> URL panel (cPanel, Plesk)</li>
                                    <li><b>Expired Date:</b> Tanggal kadaluarsa sewa</li>
                                </ul>
                            </div>

                            <hr className="border-gray-100" />

                            <div>
                                <strong className="block text-gray-800 mb-1">Status:</strong>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li><span className="text-green-600 font-bold">ACTIVE</span> - Server aktif</li>
                                    <li><span className="text-yellow-600 font-bold">MAINTENANCE</span> - Sedang perbaikan</li>
                                    <li><span className="text-red-600 font-bold">INACTIVE</span> - Server mati</li>
                                </ul>
                            </div>

                            <hr className="border-gray-100" />
                            <div>
                                <strong className="block text-gray-800 mb-1">Contoh Login Link:</strong>
                                <ul className="list-disc pl-4 space-y-1 text-xs font-mono text-gray-500">
                                    <li>https://server.com:2083 (cPanel)</li>
                                    <li>https://server.com:8443 (Plesk)</li>
                                    <li>https://server.com:2222 (DirectAdmin)</li>
                                </ul>
                            </div>

                            <div className="p-3 bg-cyan-50 text-cyan-800 rounded text-xs mt-4">
                                ℹ️ Password akan dienkripsi secara otomatis untuk keamanan data.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
