import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { invoiceId } = await request.json();

    if (!invoiceId) {
      return NextResponse.json(
        { message: 'Invoice ID required' },
        { status: 400 }
      );
    }

    // Find order by invoiceId
    const order = await prisma.order.findUnique({
      where: { invoiceId },
    });

    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    // Only update if status is PENDING
    if (order.status === 'PENDING') {
      await prisma.order.update({
        where: { invoiceId },
        data: {
          status: 'CANCELLED',
        },
      });

      console.log(`Order ${invoiceId} auto-updated to CANCELLED`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cancel Payment Error:', error);
    return NextResponse.json(
      { message: 'Failed to cancel payment' },
      { status: 500 }
    );
  }
}
