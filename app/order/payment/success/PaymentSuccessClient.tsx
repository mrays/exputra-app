'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface OrderData {
    invoiceId: string;
    domainSearch: string;
    selectedDomain: { extension: string; price: number } | null;
    selectedPackage: { name: string; price: number } | null;
    personalData: { fullName: string; email: string; phone: string };
    totalPrice: number;
    timestamp: number;
}

export default function PaymentSuccessClient() {
    const [isHydrated, setIsHydrated] = useState(false);
    const [orderData, setOrderData] = useState<OrderData | null>(null);
    const [confirmationStatus, setConfirmationStatus] = useState<'confirming' | 'confirmed' | 'error'>('confirming');
    const searchParams = useSearchParams();

    const reference =
        searchParams.get('reference') ||
        searchParams.get('merchantOrderId') ||
        '';

    const resultCode = searchParams.get('resultCode');

    useEffect(() => {
        setIsHydrated(true);

        if (resultCode && resultCode !== '00') {
            console.error('[PaymentSuccess] Result code is not 00:', resultCode);
            window.location.href =
                '/order/payment/failed' + window.location.search;
            return;
        }

        let timeoutId: NodeJS.Timeout;

        const savedOrder = localStorage.getItem('pending-order');
        if (savedOrder) {
            try {
                const parsed = JSON.parse(savedOrder);
                setOrderData(parsed);

                if (parsed.invoiceId) {
                    console.log('[PaymentSuccess] Confirming payment for:', parsed.invoiceId);
                    confirmPayment(parsed.invoiceId);
                    
                    // Add timeout - if confirmation takes too long, show error
                    timeoutId = setTimeout(() => {
                        console.warn('[PaymentSuccess] Confirmation timeout after 10 seconds');
                        setConfirmationStatus('error');
                    }, 10000);
                }
            } catch (e) {
                console.error('[PaymentSuccess] Failed to parse order data:', e);
                setConfirmationStatus('error');
            }
        } else {
            console.warn('[PaymentSuccess] No pending order in localStorage');
            // If no localStorage data, try to fetch from API using invoiceId from URL
            const invoiceId = searchParams.get('merchantOrderId');
            if (invoiceId) {
                console.log('[PaymentSuccess] Attempting to fetch order from API:', invoiceId);
                confirmPayment(invoiceId);
                
                // Add timeout for API call too
                timeoutId = setTimeout(() => {
                    console.warn('[PaymentSuccess] Confirmation timeout after 10 seconds');
                    setConfirmationStatus('error');
                }, 10000);
            } else {
                setConfirmationStatus('error');
            }
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [resultCode]);

    const confirmPayment = async (invoiceId: string) => {
        try {
            console.log('[PaymentSuccess] Calling confirm-payment endpoint for:', invoiceId);
            const response = await fetch('/api/order/confirm-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    invoiceId,
                    reference,
                }),
            });

            const data = await response.json();
            console.log('[PaymentSuccess] Confirm response:', data);

            if (response.ok && data.success) {
                setConfirmationStatus('confirmed');
            } else {
                console.error('[PaymentSuccess] Confirm failed:', data);
                setConfirmationStatus('error');
            }
        } catch (error) {
            console.error('[PaymentSuccess] Failed to confirm payment:', error);
            setConfirmationStatus('error');
        }
    };

    const handleNewOrder = () => {
        localStorage.removeItem('pending-order');
        localStorage.removeItem('order-storage');
        window.location.href = '/';
    };

    if (!isHydrated) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 px-4 py-6">
            <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-6 text-center">
                {confirmationStatus === 'confirming' && (
                    <>
                        <div className="flex justify-center mb-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Memverifikasi Pembayaran...</h1>
                        <p className="text-gray-600">
                            Sistem sedang memverifikasi pembayaran Anda dengan server pembayaran.
                        </p>
                    </>
                )}

                {confirmationStatus === 'confirmed' && (
                    <>
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Pembayaran Berhasil!</h1>
                        <p className="text-gray-600 mb-6">
                            Terima kasih atas pembayaran Anda. Pesanan Anda sedang diproses.
                        </p>

                        <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
                            <p>
                                <strong>Invoice:</strong> {orderData?.invoiceId || '-'}
                            </p>
                            <p>
                                <strong>Total:</strong>{' '}
                                Rp {(orderData?.totalPrice || 0).toLocaleString('id-ID')}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Link
                                href="/client/dashboard/invoices"
                                className="flex-1 bg-cyan-500 text-white py-2 rounded-lg hover:bg-cyan-600 transition-colors font-medium"
                            >
                                Cek Pesanan
                            </Link>

                            <button
                                onClick={handleNewOrder}
                                className="flex-1 border border-cyan-500 text-cyan-600 py-2 rounded-lg hover:bg-cyan-50 transition-colors font-medium"
                            >
                                Pesan Lagi
                            </button>
                        </div>
                    </>
                )}

                {confirmationStatus === 'error' && (
                    <>
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold mb-2 text-red-600">Verifikasi Gagal</h1>
                        <p className="text-gray-600 mb-6">
                            Terjadi kesalahan saat memverifikasi pembayaran. Pesanan Anda mungkin sudah tercatat.
                        </p>

                        <div className="text-left bg-yellow-50 rounded-lg p-4 mb-6 border border-yellow-200">
                            <p className="text-sm text-yellow-800">
                                <strong>Invoice:</strong> {orderData?.invoiceId || '-'}
                            </p>
                            <p className="text-sm text-yellow-800 mt-2">
                                Silakan login ke dashboard untuk memeriksa status pesanan Anda.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Link
                                href="/client/dashboard/invoices"
                                className="flex-1 bg-cyan-500 text-white py-2 rounded-lg hover:bg-cyan-600 transition-colors font-medium"
                            >
                                Cek Status di Dashboard
                            </Link>

                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Coba Lagi
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
