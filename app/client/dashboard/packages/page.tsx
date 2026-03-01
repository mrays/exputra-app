'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Eye, EyeOff } from 'lucide-react';

interface PackageOrder {
    id: string;
    invoiceId: string;
    domainName: string;
    status: string;
    total: number;
    createdAt: string;
    paidAt: string | null;
    expiredAt: string | null;
    domain: { extension: string };
    package: { name: string; duration: number };
    template: { name: string };
    websiteUsername?: string;
    websitePassword?: string;
    loginUrl?: string;
}

const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-green-100 text-green-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-emerald-100 text-emerald-800',
    CANCELLED: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
    PENDING: 'Menunggu Pembayaran',
    PAID: 'Sudah Dibayar',
    PROCESSING: 'Diproses',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan',
};

export default function MyPackagesPage() {
    const [packages, setPackages] = useState<PackageOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const res = await fetch('/api/client/packages');
            if (res.ok) {
                const data = await res.json();
                setPackages(data);
            }
        } catch (error) {
            console.error('Failed to fetch packages:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateExpiryDate = (paidAt: string | null, duration: number) => {
        if (!paidAt) return 'N/A';
        const expiry = new Date(paidAt);
        expiry.setDate(expiry.getDate() + (duration * 365));
        return expiry.toLocaleDateString('id-ID');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">My Packages</h1>
                <p className="text-gray-600 mt-2">Paket website yang Anda miliki</p>
            </div>

            {packages.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum Ada Paket</h3>
                    <p className="text-gray-600">Anda belum memiliki paket website aktif.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {packages.map((pkg) => (
                        <div
                            key={pkg.id}
                            className="bg-white rounded-xl shadow-sm border-2 border-gray-100 hover:border-blue-200 transition-all overflow-hidden"
                        >
                            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 text-white">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold">{pkg.package.name}</h3>
                                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[pkg.status] || 'bg-gray-100'}`}>
                                        {statusLabels[pkg.status] || pkg.status}
                                    </span>
                                </div>
                                <p className="text-sm opacity-90">{pkg.domainName}{pkg.domain.extension}</p>
                            </div>

                            <div className="p-4 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Template:</span>
                                    <span className="font-medium text-gray-900">{pkg.template.name}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Durasi:</span>
                                    <span className="font-medium text-gray-900">{pkg.package.duration} Tahun</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tanggal Order:</span>
                                    <span className="font-medium text-gray-900">
                                        {new Date(pkg.createdAt).toLocaleDateString('id-ID')}
                                    </span>
                                </div>
                                {pkg.expiredAt ? (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Berlaku Hingga:</span>
                                        <span className={`font-medium ${new Date(pkg.expiredAt) > new Date() ? 'text-green-600' : 'text-red-600'}`}>
                                            {new Date(pkg.expiredAt).toLocaleDateString('id-ID')}
                                        </span>
                                    </div>
                                ) : pkg.paidAt && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Berlaku Hingga:</span>
                                        <span className="font-medium text-green-600">
                                            {calculateExpiryDate(pkg.paidAt, pkg.package.duration)}
                                        </span>
                                    </div>
                                )}
                                
                                {/* Website Access Credentials */}
                                {(pkg.loginUrl || pkg.websiteUsername || pkg.websitePassword) && (
                                    <div className="pt-3 border-t mt-4">
                                        <div className="bg-green-50 rounded-lg p-3 space-y-2 border border-green-200">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-green-700 mb-2">
                                                <CheckCircle2 className="w-4 h-4" />
                                                Akses Website
                                            </div>
                                            
                                            {pkg.loginUrl && (
                                                <div className="text-xs">
                                                    <p className="text-gray-600 font-medium mb-1">Login:</p>
                                                    <a 
                                                        href={pkg.loginUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-700 underline break-all"
                                                    >
                                                        {pkg.loginUrl}
                                                    </a>
                                                </div>
                                            )}
                                            
                                            {pkg.websiteUsername && (
                                                <div className="text-xs">
                                                    <p className="text-gray-600 font-medium mb-1">Username:</p>
                                                    <code className="bg-white px-2 py-1 rounded border border-green-300 font-mono break-all text-gray-900">
                                                        {pkg.websiteUsername}
                                                    </code>
                                                </div>
                                            )}
                                            
                                            {pkg.websitePassword && (
                                                <div className="text-xs">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <p className="text-gray-600 font-medium">Password:</p>
                                                        <button
                                                            onClick={() => setShowPasswords(prev => ({
                                                                ...prev,
                                                                [pkg.id]: !prev[pkg.id]
                                                            }))}
                                                            className="text-gray-500 hover:text-gray-700"
                                                        >
                                                            {showPasswords[pkg.id] ? (
                                                                <EyeOff className="w-3 h-3" />
                                                            ) : (
                                                                <Eye className="w-3 h-3" />
                                                            )}
                                                        </button>
                                                    </div>
                                                    <code className="bg-white px-2 py-1 rounded border border-green-300 font-mono break-all text-gray-900">
                                                        {showPasswords[pkg.id] ? pkg.websitePassword : '•'.repeat(pkg.websitePassword.length)}
                                                    </code>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                <div className="pt-3 border-t">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">Invoice:</span>
                                        <span className="text-xs font-mono text-gray-700">{pkg.invoiceId}</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-xs text-gray-500">Total:</span>
                                        <span className="text-sm font-bold text-blue-600">
                                            IDR {pkg.total.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
