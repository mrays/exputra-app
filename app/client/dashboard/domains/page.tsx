'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, AlertCircle, Clock, CheckCircle, Loader } from 'lucide-react';

interface Domain {
    id: string;
    domainName: string;
    registrar: string;
    expiredAt: string;
    status: string;
    clientEmail: string;
}

export default function MyDomainsPage() {
    const [domains, setDomains] = useState<Domain[]>([]);
    const [loading, setLoading] = useState(true);
    const [renewingDomainId, setRenewingDomainId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/client/domains')
            .then(res => res.json())
            .then(data => {
                setDomains(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const isExpired = (expiredAt: string) => {
        return new Date(expiredAt) < new Date();
    };

    const getDaysUntilExpiry = (expiredAt: string) => {
        const days = Math.ceil((new Date(expiredAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return days;
    };

    const handleRenewDomain = async (domain: Domain) => {
        setRenewingDomainId(domain.id);
        try {
            // Get renewal price from domain extension or use default
            const renewalPrice = 500000; // 500k IDR default renewal price - adjust as needed
            
            const response = await fetch('/api/client/domains/renew', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    domainId: domain.id,
                    domainName: domain.domainName,
                    renewalPrice,
                    years: 1
                })
            });

            if (!response.ok) {
                const error = await response.json();
                alert(`Error creating invoice: ${error.message}`);
                setRenewingDomainId(null);
                return;
            }

            const result = await response.json();
            if (result.success) {
                // Redirect to invoices page to complete payment
                router.push('/client/dashboard/invoices');
            } else {
                alert('Failed to create invoice');
                setRenewingDomainId(null);
            }
        } catch (error) {
            console.error('Renewal error:', error);
            alert('Failed to initiate domain renewal');
            setRenewingDomainId(null);
        }
    };

    const expiredDomains = domains.filter(d => isExpired(d.expiredAt));
    const expiringSoonDomains = domains.filter(d => !isExpired(d.expiredAt) && getDaysUntilExpiry(d.expiredAt) <= 30);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin">⚙️</div>
            <span className="ml-2 text-gray-600">Loading domains...</span>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Globe className="w-8 h-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-900">My Domains</h1>
                </div>
                <p className="text-gray-600 ml-11">Manage your registered domains and track expiration dates</p>
            </div>

            {/* Alert Sections */}
            {expiredDomains.length > 0 && (
                <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-6 shadow-sm">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0">
                            <AlertCircle className="w-6 h-6 text-red-600 mt-1" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-red-900 text-lg">Expired Domain(s)</h3>
                            <p className="text-sm text-red-800 mt-2">
                                You have <span className="font-bold">{expiredDomains.length}</span> expired domain(s). Please renew them immediately to avoid losing access:
                            </p>
                            <div className="mt-3 space-y-2">
                                {expiredDomains.map(d => (
                                    <p key={d.id} className="text-sm text-red-900 font-medium">
                                        🔴 <span className="font-bold text-base">{d.domainName}</span> (expired {new Date(d.expiredAt).toLocaleDateString()})
                                    </p>
                                ))}
                            </div>
                            <button
                                onClick={() => {
                                    if (expiredDomains.length === 1) {
                                        handleRenewDomain(expiredDomains[0]);
                                    } else {
                                        handleRenewDomain(expiredDomains[0]);
                                    }
                                }}
                                disabled={renewingDomainId !== null}
                                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 font-bold text-sm transition-colors"
                            >
                                {renewingDomainId ? (
                                    <>
                                        <Loader className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>Renew Now →</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {expiringSoonDomains.length > 0 && (
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6 shadow-sm">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0">
                            <Clock className="w-6 h-6 text-orange-600 mt-1" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-orange-900 text-lg">Domain Expiring Soon</h3>
                            <p className="text-sm text-orange-800 mt-2">
                                These domains will expire within 30 days:
                            </p>
                            <div className="mt-3 space-y-2">
                                {expiringSoonDomains.map(d => (
                                    <p key={d.id} className="text-sm text-orange-900 font-medium">
                                        ⏱️ <span className="font-bold text-base">{d.domainName}</span> ({getDaysUntilExpiry(d.expiredAt)} days left)
                                    </p>
                                ))}
                            </div>
                            <button
                                onClick={() => {
                                    if (expiringSoonDomains.length === 1) {
                                        handleRenewDomain(expiringSoonDomains[0]);
                                    } else {
                                        handleRenewDomain(expiringSoonDomains[0]);
                                    }
                                }}
                                disabled={renewingDomainId !== null}
                                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-orange-400 font-bold text-sm transition-colors"
                            >
                                {renewingDomainId ? (
                                    <>
                                        <Loader className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>Renew Now →</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Domains Grid */}
            {domains.length === 0 ? (
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                    <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-600 mb-2">No Domains Found</h3>
                    <p className="text-gray-500">You don't have any registered domains yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {domains.map(domain => {
                        const expired = isExpired(domain.expiredAt);
                        const daysLeft = getDaysUntilExpiry(domain.expiredAt);
                        const isExpiringSoon = !expired && daysLeft <= 30;

                        return (
                            <div
                                key={domain.id}
                                className={`rounded-xl border-2 overflow-hidden transition-all hover:shadow-lg hover:scale-105 ${
                                    expired
                                        ? 'bg-red-50 border-red-200 shadow-md'
                                        : isExpiringSoon
                                            ? 'bg-orange-50 border-orange-200 shadow-md'
                                            : 'bg-white border-gray-200 shadow-sm'
                                }`}
                            >
                                {/* Card Header */}
                                <div className={`px-6 py-4 border-b-2 ${
                                    expired
                                        ? 'bg-red-100 border-red-300'
                                        : isExpiringSoon
                                            ? 'bg-orange-100 border-orange-300'
                                            : 'bg-blue-50 border-blue-200'
                                }`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3 flex-1">
                                            <Globe className={`w-6 h-6 flex-shrink-0 mt-1 ${
                                                expired ? 'text-red-600' : isExpiringSoon ? 'text-orange-600' : 'text-blue-600'
                                            }`} />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-bold text-gray-900 break-all">{domain.domainName}</h3>
                                                <p className="text-xs text-gray-600 mt-1">{domain.registrar || 'Not specified'}</p>
                                            </div>
                                        </div>
                                        <div>
                                            {expired && (
                                                <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                                                    EXPIRED
                                                </span>
                                            )}
                                            {isExpiringSoon && (
                                                <span className="inline-block px-3 py-1 bg-orange-600 text-white text-xs font-bold rounded-full">
                                                    {daysLeft}d LEFT
                                                </span>
                                            )}
                                            {!expired && !isExpiringSoon && (
                                                <span className="inline-block px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" />
                                                    ACTIVE
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="px-6 py-5 space-y-4">
                                    {/* Expiry Date */}
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Expiry Date</p>
                                        <p className={`text-lg font-bold ${
                                            expired ? 'text-red-700' : isExpiringSoon ? 'text-orange-700' : 'text-gray-900'
                                        }`}>
                                            {domain.expiredAt ? new Date(domain.expiredAt).toLocaleDateString('en-US', { 
                                                year: 'numeric', 
                                                month: 'short', 
                                                day: 'numeric' 
                                            }) : '-'}
                                        </p>
                                    </div>

                                    {/* Days Info */}
                                    {!expired && (
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Time Left</p>
                                            <p className={`text-lg font-bold ${
                                                isExpiringSoon ? 'text-orange-700' : 'text-green-700'
                                            }`}>
                                                {daysLeft > 0 ? `${daysLeft} days` : 'Expires today'}
                                            </p>
                                        </div>
                                    )}

                                    {/* Status */}
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</p>
                                        <div className="flex gap-2 flex-wrap">
                                            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                                                expired
                                                    ? 'bg-red-100 text-red-700'
                                                    : isExpiringSoon
                                                        ? 'bg-orange-100 text-orange-700'
                                                        : 'bg-green-100 text-green-700'
                                            }`}>
                                                {expired ? 'EXPIRED' : isExpiringSoon ? 'EXPIRING SOON' : domain.status || 'ACTIVE'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer */}
                                {(expired || isExpiringSoon) && (
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                        <button
                                            onClick={() => handleRenewDomain(domain)}
                                            disabled={renewingDomainId === domain.id}
                                            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-colors ${
                                                expired
                                                    ? 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400'
                                                    : 'bg-orange-600 text-white hover:bg-orange-700 disabled:bg-orange-400'
                                            }`}
                                        >
                                            {renewingDomainId === domain.id ? (
                                                <>
                                                    <Loader className="w-4 h-4 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>Renew Domain →</>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
