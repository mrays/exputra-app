'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AddDomainPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<any[]>([]);
    const [registrars, setRegistrars] = useState<any[]>([]);
    const [servers, setServers] = useState<any[]>([]);

    // Form Data
    const [formData, setFormData] = useState({
        domainName: '',
        clientEmail: '',
        registrarId: '',
        registrar: '',
        registeredAt: '',
        expiredAt: '',
        status: 'ACTIVE',
        autoRenew: false,
        notes: '',
        serverId: '',
    });

    useEffect(() => {
        // Fetch clients and registrars
        Promise.all([
            fetch('/api/admin/clients').then(res => res.json()),
            fetch('/api/admin/domain-registrars').then(res => res.json()),
            fetch('/api/admin/client-servers').then(res => res.json())
        ]).then(([clientsData, registrarsData, serversData]) => {
            setClients(clientsData);
            setRegistrars(registrarsData);
            setServers(serversData);
        }).catch(err => console.error(err));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/admin/client-domains', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push('/admin/client-domains');
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to create domain');
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
                    <span>+</span> Add New Domain
                </h1>
                <p className="text-gray-500 text-sm mt-1">Create a new domain with client assignments</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-700 mb-6 pb-2 border-b">Domain Information</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Domain Name *</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-gray-400">🔗</span>
                                    <input
                                        type="text"
                                        required
                                        value={formData.domainName}
                                        onChange={(e) => setFormData({ ...formData, domainName: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                        placeholder="example.com"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Enter domain name without www or http://</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Assign to Client *</label>
                                <select
                                    required
                                    value={formData.clientEmail}
                                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                >
                                    <option value="">Select Client</option>
                                    {clients.map((client: any) => (
                                        <option key={client.email} value={client.email}>{client.name} ({client.company || client.email})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Domain Registrar * (Integrated)</label>
                                <div className="flex gap-2">
                                    <select
                                        value={formData.registrarId}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setFormData({
                                                ...formData,
                                                registrarId: val,
                                                registrar: val ? e.target.options[e.target.selectedIndex].text : ''
                                            });
                                        }}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                    >
                                        <option value="">Select Registrar</option>
                                        {registrars.map((reg: any) => (
                                            <option key={reg.id} value={reg.id}>{reg.name}</option>
                                        ))}
                                    </select>
                                    <Link href="/admin/domain-registrars" target="_blank" className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center">
                                        ⚙️
                                    </Link>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Select from integrated registrars or <Link href="/admin/domain-registrars" className="text-blue-600 hover:underline">add new</Link>.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Server Name (Integrated)</label>
                                <div className="flex gap-2">
                                    <select
                                        value={formData.serverId}
                                        onChange={(e) => setFormData({ ...formData, serverId: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                    >
                                        <option value="">Select Server</option>
                                        {servers.map((server: any) => (
                                            <option key={server.id} value={server.id}>{server.serverName} ({server.ipAddress})</option>
                                        ))}
                                    </select>
                                    <Link href="/admin/client-servers" target="_blank" className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center">
                                        🖥️
                                    </Link>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Link this domain to an existing server or <Link href="/admin/client-servers" className="text-blue-600 hover:underline">manage servers</Link>.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Registered Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.registeredAt}
                                        onChange={(e) => setFormData({ ...formData, registeredAt: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expiration Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.expiredAt}
                                        onChange={(e) => setFormData({ ...formData, expiredAt: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status *</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="EXPIRED">Expired</option>
                                        <option value="PENDING">Pending</option>
                                        <option value="SUSPENDED">Suspended</option>
                                    </select>
                                </div>
                                <div className="flex items-center pt-6">
                                    <input
                                        type="checkbox"
                                        id="autoRenew"
                                        checked={formData.autoRenew}
                                        onChange={(e) => setFormData({ ...formData, autoRenew: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                                    />
                                    <label htmlFor="autoRenew" className="text-sm text-gray-700">Auto Renew Enabled</label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notes</label>
                                <textarea
                                    rows={3}
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none"
                                    placeholder="Additional notes about this domain..."
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 mt-6 border-t">
                            <Link href="/admin/client-domains" className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                                ← Back to Domains
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
                            >
                                {loading ? 'Saving...' : '💾 Create Domain'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 sticky top-24">
                        <h3 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2">
                            ℹ️ Quick Guide
                        </h3>
                        {/* Keep guide content same */}
                        <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-xs rounded">
                            Registrars are now integrated! Use the gear icon to manage your registrar accounts.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
