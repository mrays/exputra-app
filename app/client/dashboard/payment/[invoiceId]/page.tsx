'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

interface PaymentMethod {
    id: string;
    name: string;
    icon: string;
    duitkuCode: string;
}

const paymentMethods: PaymentMethod[] = [
    { id: 'va-bni', name: 'BNI Virtual Account', icon: '🏦', duitkuCode: 'I1' },
    { id: 'va-bri', name: 'BRI Virtual Account', icon: '🏦', duitkuCode: 'BR' },
    { id: 'va-mandiri', name: 'Mandiri Virtual Account', icon: '🏦', duitkuCode: 'M2' },
    { id: 'qris-nobu', name: 'QRIS (Nobu Bank)', icon: '📲', duitkuCode: 'SP' },
];

export default function ClientInvoicePaymentPage({ params }: { params: Promise<{ invoiceId: string }> }) {
    const { invoiceId } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<any>(null);
    const [selectedPayment, setSelectedPayment] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [paymentResult, setPaymentResult] = useState<any>(null);

    useEffect(() => {
        fetch(`/api/client/invoices/${invoiceId}`)
            .then(res => res.json())
            .then(data => {
                if (data.message) {
                    setError(data.message);
                } else {
                    setOrder(data);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [invoiceId]);

    const handlePayment = async () => {
        if (!selectedPayment) {
            setError('Please select a payment method');
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            const method = paymentMethods.find(pm => pm.id === selectedPayment);
            const response = await fetch('/api/payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: order.invoiceId,
                    amount: order.total,
                    customerName: order.customerName,
                    customerEmail: order.customerEmail,
                    customerPhone: order.customerPhone,
                    productDetails: `Payment for Invoice #${order.invoiceId}`,
                    paymentMethod: method?.duitkuCode,
                    orderData: {
                        domainName: order.domainName,
                        domainId: order.domainId,
                        templateId: order.templateId,
                        packageId: order.packageId,
                        subtotal: order.subtotal,
                        discount: order.discount,
                        services: order.services?.map((s: any) => ({ id: s.serviceId, price: s.price })) || [],
                    }
                }),
            });

            const result = await response.json();
            if (result.success) {
                setPaymentResult(result.data);
                if (result.data.paymentUrl) window.open(result.data.paymentUrl, '_blank');
            } else {
                setError(result.error || 'Payment failed to process');
            }
        } catch (err) {
            setError('System error processing payment');
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500 italic">Finding your invoice...</div>;
    if (!order) return <div className="p-8 text-center text-red-500 font-bold">Invoice not found or unauthorized.</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden">
                <div className="bg-cyan-600 p-8 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tighter">Complete Payment</h1>
                            <p className="opacity-80 font-bold text-xs uppercase tracking-widest mt-1">Invoice #{order.invoiceId}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold opacity-70 uppercase">Amount Due</p>
                            <p className="text-3xl font-black tracking-tighter">IDR {order.total.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b pb-2">1. Select Payment Method</h3>
                        <div className="space-y-3">
                            {paymentMethods.map(method => (
                                <div
                                    key={method.id}
                                    onClick={() => setSelectedPayment(method.id)}
                                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${selectedPayment === method.id ? 'border-cyan-600 bg-cyan-50 shadow-lg shadow-cyan-50' : 'border-gray-100 hover:border-cyan-200'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl">{method.icon}</span>
                                        <span className="font-bold text-gray-700">{method.name}</span>
                                    </div>
                                    {selectedPayment === method.id && <span className="text-cyan-600">✓</span>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b pb-2">2. Review Details</h3>
                        <div className="bg-gray-50 rounded-2xl p-6 space-y-4 border border-gray-100 italic">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-bold">Domain</span>
                                <span className="font-black text-gray-900">{order.domainName}{order.domain?.extension}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-bold">Package</span>
                                <span className="font-black text-gray-900">{order.package?.name}</span>
                            </div>
                            <div className="pt-4 border-t flex justify-between items-center text-cyan-700">
                                <span className="font-black uppercase text-xs">Final Total</span>
                                <span className="text-xl font-black tracking-tighter">IDR {order.total.toLocaleString()}</span>
                            </div>
                        </div>

                        {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100 italic">{error}</div>}

                        {paymentResult ? (
                            <div className="p-4 bg-green-50 text-green-700 rounded-xl text-xs font-bold border border-green-100">
                                Payment request sent! Please check the payment window.
                                {paymentResult.vaNumber && <p className="mt-2 text-lg">VA: {paymentResult.vaNumber}</p>}
                            </div>
                        ) : (
                            <button
                                onClick={handlePayment}
                                disabled={isProcessing}
                                className="w-full py-4 bg-cyan-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-cyan-700 transition-all shadow-xl shadow-cyan-100 disabled:opacity-50"
                            >
                                {isProcessing ? 'Processing...' : 'Pay with Secure Portal'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="text-center">
                <button onClick={() => router.push('/client/dashboard/invoices')} className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-cyan-600 transition-colors">← Cancel & Go Back to Invoices</button>
            </div>
        </div>
    );
}
