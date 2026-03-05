'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Users, Globe, Server, Building2 } from 'lucide-react';
import Button from '@/components/Button';
import { formatDateShort } from '@/lib/utils';

interface Stats {
    clients: { total: number; active: number; inactive: number };
    domains: { total: number; active: number; expiring: number; expired: number; byRegistrar: { registrar: string; count: number }[] };
    servers: { total: number; active: number; inactive: number; byType: { type: string; count: number }[] };
    registrars: { total: number; active: number; inactive: number };
}

interface Domain {
    id: string;
    domainName: string;
    expiredAt: string;
    status: string;
    client: { name: string; email: string };
}

export default function MonitoringPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [expiring, setExpiring] = useState<Domain[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, expiringRes] = await Promise.all([
                fetch('/api/admin/monitoring/stats'),
                fetch('/api/admin/monitoring/expiring?days=30'),
            ]);
            setStats(await statsRes.json());
            setExpiring(await expiringRes.json());
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
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
            <div className="mb-6 flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Monitoring</h1>
                    <p className="text-gray-600 mt-1">Overview klien, domain, dan server</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* Clients */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Klien</h3>
                        <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Total</p>
                            <p className="text-3xl font-bold text-blue-600">{stats?.clients.total}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                            <div>
                                <p className="text-xs text-gray-600 font-semibold">Aktif</p>
                                <p className="text-lg font-bold text-green-600">{stats?.clients.active}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 font-semibold">Nonaktif</p>
                                <p className="text-lg font-bold text-gray-600">{stats?.clients.inactive}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Domains */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Domain</h3>
                        <Globe className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Total</p>
                            <p className="text-3xl font-bold text-blue-600">{stats?.domains.total}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 text-xs">
                            <div>
                                <p className="text-gray-600 font-semibold">Aktif</p>
                                <p className="font-bold text-green-600">{stats?.domains.active}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 font-semibold">Berakhir</p>
                                <p className="font-bold text-red-600">{stats?.domains.expired}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Servers */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Server</h3>
                        <Server className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Total</p>
                            <p className="text-3xl font-bold text-blue-600">{stats?.servers.total}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                            <div>
                                <p className="text-xs text-gray-600 font-semibold">Aktif</p>
                                <p className="text-lg font-bold text-green-600">{stats?.servers.active}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 font-semibold">Nonaktif</p>
                                <p className="text-lg font-bold text-gray-600">{stats?.servers.inactive}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Registrars */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Registrar</h3>
                        <Building2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Total</p>
                            <p className="text-3xl font-bold text-purple-600">{stats?.registrars.total}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                            <div>
                                <p className="text-xs text-gray-600 font-semibold">Aktif</p>
                                <p className="text-lg font-bold text-green-600">{stats?.registrars.active}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 font-semibold">Nonaktif</p>
                                <p className="text-lg font-bold text-gray-600">{stats?.registrars.inactive}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Domains by Registrar */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Domain per Registrar</h3>
                    <div className="space-y-4">
                        {stats?.domains.byRegistrar.map((item, idx) => (
                            <div key={idx}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-gray-900">{item.registrar}</span>
                                    <span className="text-sm font-bold text-blue-600">{item.count}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full transition-all"
                                      style={{ width: `${(item.count / (stats?.domains.total || 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Servers by Type */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Server per Tipe</h3>
                    <div className="space-y-4">
                        {stats?.servers.byType.map((item, idx) => (
                            <div key={idx}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-gray-900">{item.type}</span>
                                    <span className="text-sm font-bold text-green-600">{item.count}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-green-600 h-2 rounded-full transition-all"
                                      style={{ width: `${(item.count / (stats?.servers.total || 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Expiring Domains */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Domain Berakhir (30 Hari ke Depan)</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Domain</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Klien</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Berakhir</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Sisa Hari</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {expiring.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Tidak ada domain yang berakhir</td></tr>
                            ) : (
                                expiring.map((domain) => {
                                    const daysLeft = Math.ceil((new Date(domain.expiredAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                    return (
                                        <tr key={domain.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">{domain.domainName}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="font-semibold text-gray-900">{domain.client.name}</div>
                                                <div className="text-xs text-gray-500">{domain.client.email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{new Date(domain.expiredAt).toLocaleDateString('id-ID')}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`font-bold ${daysLeft <= 7 ? 'text-red-600' : daysLeft <= 14 ? 'text-orange-600' : 'text-yellow-600'}`}>
                                                    {daysLeft} hari
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">{domain.status}</span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

