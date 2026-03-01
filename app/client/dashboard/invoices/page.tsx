'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, DollarSign, AlertCircle, CheckCircle, Clock, CreditCard, Smartphone, Building2, X } from 'lucide-react';

interface Order {
    id: string;
    invoiceId: string;
    domainName: string;
    total: number;
    status: string;
    createdAt: string;
    paymentMethod: string;
    customerEmail?: string;
    domainId?: string;
    templateId?: string;
    packageId?: string;
    promoId?: string | null;
    subtotal?: number;
    discount?: number;
}

interface PaymentMethod {
    id: string;
    name: string;
    icon: string;
    duitkuCode: string;
}

const statusColors: Record<string, { bg: string; text: string; icon: string }> = {
    PENDING: { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', icon: '⏳' },
    PAID: { bg: 'bg-green-50 border-green-200', text: 'text-green-700', icon: '✓' },
    PROCESSING: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: '⚙' },
    COMPLETED: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: '✓✓' },
    CANCELLED: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: '✕' },
};

const paymentMethods: PaymentMethod[] = [
    { id: 'va-bni', name: 'BNI Virtual Account', icon: '🏦', duitkuCode: 'I1' },
    { id: 'va-bri', name: 'BRI Virtual Account', icon: '🏦', duitkuCode: 'BR' },
    { id: 'va-mandiri', name: 'Mandiri Virtual Account', icon: '🏦', duitkuCode: 'M2' },
    { id: 'qris-nobu', name: 'QRIS (Nobu Bank)', icon: '📲', duitkuCode: 'SP' },
];

const paymentMethodDisplay: Record<string, { label: string; icon: React.ReactNode }> = {
    'va-bni': { label: '🏦 BNI Virtual Account', icon: <Building2 className="w-4 h-4" /> },
    'va-bri': { label: '🏦 BRI Virtual Account', icon: <Building2 className="w-4 h-4" /> },
    'va-mandiri': { label: '🏦 Mandiri Virtual Account', icon: <Building2 className="w-4 h-4" /> },
    'qris-nobu': { label: '📲 QRIS (Nobu Bank)', icon: <Smartphone className="w-4 h-4" /> },
};

export default function MyInvoicesPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');

    useEffect(() => {
        fetch('/api/client/orders')
            .then(res => res.json())
            .then(data => {
                setOrders(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handlePayment = async (order: Order) => {
        setSelectedInvoice(order);
        setPaymentMethod('');
        setShowPaymentModal(true);
    };

    const submitPayment = async () => {
        if (!paymentMethod) {
            alert('Please select a payment method');
            return;
        }

        setPaymentLoading(true);
        try {
            // Find the selected payment method to get duitkuCode
            const selectedMethod = paymentMethods.find(pm => pm.id === paymentMethod);
            if (!selectedMethod) {
                alert('Invalid payment method');
                setPaymentLoading(false);
                return;
            }

            console.log('Submitting payment with:', {
                invoiceId: selectedInvoice?.invoiceId,
                amount: selectedInvoice?.total,
                paymentMethod: selectedMethod.duitkuCode,
                domain: selectedInvoice?.domainName
            });

            // Save order data to localStorage for success page
            const orderData = {
                invoiceId: selectedInvoice?.invoiceId,
                domainSearch: selectedInvoice?.domainName,
                selectedDomain: { extension: '', price: selectedInvoice?.total || 0 },
                selectedPackage: { name: 'Invoice Payment', price: 0 },
                personalData: { fullName: 'Customer', email: selectedInvoice?.customerEmail || '', phone: '' },
                totalPrice: selectedInvoice?.total || 0,
                timestamp: Date.now()
            };
            localStorage.setItem('pending-order', JSON.stringify(orderData));

            const res = await fetch('/api/payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: selectedInvoice?.invoiceId,
                    amount: selectedInvoice?.total,
                    customerName: 'Customer', // Get from profile if available
                    customerEmail: selectedInvoice?.invoiceId + '@invoice.local',
                    customerPhone: '0000000000',
                    productDetails: `Invoice Payment - ${selectedInvoice?.domainName}`,
                    paymentMethod: selectedMethod.duitkuCode,
                    orderData: {
                        domainName: selectedInvoice?.domainName,
                        invoiceId: selectedInvoice?.invoiceId,
                        domainId: selectedInvoice?.domainId,
                        templateId: selectedInvoice?.templateId,
                        packageId: selectedInvoice?.packageId,
                        promoId: selectedInvoice?.promoId || null,
                        subtotal: selectedInvoice?.subtotal || 0,
                        discount: selectedInvoice?.discount || 0,
                    }
                }),
            });

            console.log('Payment API response status:', res.status);
            
            if (!res.ok) {
                const errorText = await res.text();
                console.error('Payment API error response:', errorText);
                alert('Payment API error: ' + (res.status === 500 ? 'Server error occurred' : res.statusText));
                setPaymentLoading(false);
                return;
            }

            const result = await res.json();
            console.log('Payment API result:', result);

            if (result.success && result.data?.paymentUrl) {
                // Open payment gateway in new window (do NOT navigate from this page)
                window.open(result.data.paymentUrl, '_blank', 'width=800,height=600');
                // Close modal but stay on invoices page
                setShowPaymentModal(false);
                setSelectedInvoice(null);
                setPaymentMethod('');
                alert('✓ Payment gateway opened in new window. Complete payment there and you will be redirected.');
            } else if (result.error?.includes('Bill already paid') || result.details?.Message?.includes('Bill already paid')) {
                // Bill already paid - update local status
                const updatedOrders = orders.map(o =>
                    o.id === selectedInvoice?.id ? { ...o, status: 'PAID' } : o
                );
                setOrders(updatedOrders);
                setShowPaymentModal(false);
                setSelectedInvoice(null);
                setPaymentMethod('');
                alert('✓ Invoice already paid! Status updated.');
            } else {
                alert(result.error || result.message || 'Failed to process payment');
                setPaymentLoading(false);
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Failed to process payment: ' + (error instanceof Error ? error.message : 'Unknown error'));
            setPaymentLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading invoices...</div>;

    const pendingInvoices = orders.filter(o => o.status === 'PENDING');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        Invoices
                    </h1>
                    <p className="text-gray-600 mt-2">Manage your payments and billing history</p>
                </div>
            </div>

            {/* Pending Invoices Alert */}
            {pendingInvoices.length > 0 && (
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-orange-500 rounded-lg p-5 shadow-md">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0">
                            <AlertCircle className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-orange-900 text-lg">Pending Payments</h3>
                            <p className="text-sm text-orange-800 mt-2">
                                You have <span className="font-bold">{pendingInvoices.length}</span> invoice(s) awaiting payment:
                            </p>
                            <div className="mt-4 space-y-3">
                                {pendingInvoices.map(invoice => (
                                    <div key={invoice.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-lg border border-orange-200 shadow-sm gap-4">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="p-3 bg-orange-100 rounded-lg flex-shrink-0">
                                                <DollarSign className="w-5 h-5 text-orange-600" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm text-gray-600">Invoice {invoice.invoiceId}</p>
                                                <p className="font-bold text-gray-900 truncate">{invoice.domainName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                                            <div className="flex-1 sm:flex-none text-right">
                                                <p className="text-sm text-gray-600 sm:hidden">Amount</p>
                                                <p className="text-xl sm:text-lg font-bold text-orange-600">IDR {invoice.total.toLocaleString()}</p>
                                            </div>
                                            <button
                                                onClick={() => handlePayment(invoice)}
                                                className="flex-1 sm:flex-none px-5 sm:px-6 py-2.5 sm:py-2 bg-orange-600 text-white rounded-lg text-sm font-bold hover:bg-orange-700 active:scale-95 transition-all shadow-md whitespace-nowrap"
                                            >
                                                Pay Now →
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Invoices Table - Desktop View */}
            <div className="hidden md:block bg-white rounded-xl shadow-md border border-gray-200">
                {/* Table Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-6">
                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        All Invoices
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Invoice ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <FileText className="w-12 h-12 text-gray-300 mb-4" />
                                            <p className="text-gray-500 font-medium">No invoices found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.id} className="hover:bg-blue-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-bold text-gray-900 text-sm">#{order.invoiceId}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">
                                                {new Date(order.createdAt).toLocaleDateString('id-ID', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-900">{order.domainName}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-gray-900">IDR {order.total.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${statusColors[order.status]?.bg} ${statusColors[order.status]?.text} border`}>
                                                <span>{statusColors[order.status]?.icon}</span>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {order.status === 'PENDING' ? (
                                                <button
                                                    onClick={() => handlePayment(order)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-xs font-bold hover:bg-orange-700 transition-all shadow-md"
                                                >
                                                    <DollarSign className="w-4 h-4" />
                                                    PAY NOW
                                                </button>
                                            ) : (
                                                <button disabled className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-xs font-bold cursor-not-allowed">
                                                    <CheckCircle className="w-4 h-4" />
                                                    COMPLETED
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Invoices Cards - Mobile View */}
            <div className="md:hidden space-y-4">
                {orders.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">No invoices found</p>
                    </div>
                ) : (
                    orders.map(order => {
                        const statusColor = statusColors[order.status];
                        return (
                            <div key={order.id} className={`rounded-xl border-2 p-5 shadow-sm transition-all ${statusColor?.bg} ${statusColor?.text}`}>
                                {/* Card Header */}
                                <div className="flex items-start justify-between gap-3 mb-4 pb-4 border-b-2" style={{borderColor: 'currentColor', opacity: 0.2}}>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold uppercase tracking-wider opacity-75">Invoice ID</p>
                                        <p className="text-lg font-bold text-gray-900 break-all">#{order.invoiceId}</p>
                                    </div>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex-shrink-0 ${statusColor?.bg} border`}>
                                        <span>{statusColor?.icon}</span>
                                        {order.status}
                                    </span>
                                </div>

                                {/* Card Body */}
                                <div className="space-y-4">
                                    {/* Date & Description */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider opacity-75 mb-1">Date</p>
                                            <p className="font-bold text-gray-900">
                                                {new Date(order.createdAt).toLocaleDateString('id-ID', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider opacity-75 mb-1">Description</p>
                                            <p className="font-bold text-gray-900 break-words">{order.domainName}</p>
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider opacity-75 mb-1">Amount</p>
                                        <p className="text-2xl font-bold text-gray-900">IDR {order.total.toLocaleString()}</p>
                                    </div>

                                    {/* Action Button */}
                                    {order.status === 'PENDING' ? (
                                        <button
                                            onClick={() => handlePayment(order)}
                                            className="w-full mt-4 px-4 py-3 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-all shadow-md flex items-center justify-center gap-2"
                                        >
                                            <DollarSign className="w-5 h-5" />
                                            PAY NOW
                                        </button>
                                    ) : (
                                        <button disabled className="w-full mt-4 px-4 py-3 bg-gray-200 text-gray-600 rounded-lg font-bold cursor-not-allowed flex items-center justify-center gap-2">
                                            <CheckCircle className="w-5 h-5" />
                                            COMPLETED
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedInvoice && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between rounded-t-xl sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <CreditCard className="w-6 h-6" />
                                <h2 className="text-xl font-bold">Payment Confirmation</h2>
                            </div>
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="p-1 hover:bg-blue-500 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body - Landscape Layout */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Column - Invoice Details */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Invoice Details</h3>
                                    
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                        <p className="text-xs text-blue-600 font-semibold uppercase">Invoice ID</p>
                                        <p className="text-lg font-bold text-gray-900 mt-1">#{selectedInvoice.invoiceId}</p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <p className="text-xs text-gray-600 font-semibold uppercase">Domain</p>
                                        <p className="text-lg font-bold text-gray-900 mt-1">{selectedInvoice.domainName}</p>
                                    </div>

                                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                        <p className="text-xs text-orange-600 font-semibold uppercase">Total Amount</p>
                                        <p className="text-3xl font-bold text-orange-600 mt-1">IDR {selectedInvoice.total.toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Right Column - Payment Methods */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Select Payment Method</h3>
                                    <div className="space-y-3">
                                        {paymentMethods.map((method) => (
                                            <label
                                                key={method.id}
                                                className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                    paymentMethod === method.id
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value={method.id}
                                                    checked={paymentMethod === method.id}
                                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                                    className="w-5 h-5 text-blue-600 cursor-pointer"
                                                />
                                                <span className={`font-medium text-base ${paymentMethod === method.id ? 'text-blue-700' : 'text-gray-700'}`}>
                                                    {method.icon} {method.name}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons - Full Width */}
                            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-bold transition-colors text-base"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitPayment}
                                    disabled={paymentLoading || !paymentMethod}
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-colors flex items-center justify-center gap-2 text-base"
                                >
                                    {paymentLoading ? (
                                        <>
                                            <span className="animate-spin">⚙</span>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="w-5 h-5" />
                                            Lanjutkan Pembayaran
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
