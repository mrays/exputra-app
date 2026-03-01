import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get all orders with payment information
    const orders = await prisma.order.findMany({
      select: {
        invoiceId: true,
        status: true,
        total: true,
        paymentRef: true,
        customerEmail: true,
        createdAt: true,
        paidAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });

    // Transform to payment logs
    const logs = orders.map((order) => ({
      id: order.invoiceId,
      invoiceId: order.invoiceId,
      type: order.status === 'PAID' ? 'SUCCESS' : 
            order.status === 'CANCELLED' ? 'CANCELLED' : 
            order.status === 'PENDING' ? 'INITIATED' : 'FAILED',
      amount: order.total,
      reference: order.paymentRef,
      customerEmail: order.customerEmail,
      message: getStatusMessage(order.status),
      timestamp: order.paidAt || order.createdAt,
    }));

    return NextResponse.json({ 
      success: true,
      logs 
    });
  } catch (error) {
    console.error('Failed to fetch payment logs:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}

function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    'PAID': 'Pembayaran berhasil dan pesanan diproses',
    'PENDING': 'Menunggu pembayaran',
    'CANCELLED': 'Pembayaran dibatalkan',
    'FAILED': 'Pembayaran gagal',
  };
  return messages[status] || 'Status tidak diketahui';
}
