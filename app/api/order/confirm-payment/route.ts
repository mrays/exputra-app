import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { invoiceId, reference } = await request.json();

    if (!invoiceId) {
      return NextResponse.json(
        { message: 'Invoice ID required' },
        { status: 400 }
      );
    }

    console.log(`[Confirm Payment] Processing invoiceId: ${invoiceId}, reference: ${reference}`);

    // Find order by invoiceId
    const order = await prisma.order.findUnique({
      where: { invoiceId },
      include: {
        domain: true,
        package: true,
      },
    });

    if (!order) {
      console.log(`[Confirm Payment] Order not found: ${invoiceId}`);
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    console.log(`[Confirm Payment] Current order status: ${order.status}`);

    // Only update if status is PENDING
    if (order.status === 'PENDING') {
      const updatedOrder = await prisma.order.update({
        where: { invoiceId },
        data: {
          status: 'PAID',
          paymentRef: reference || null,
          paidAt: new Date(),
        },
      });

      console.log(`[Confirm Payment] Order ${invoiceId} updated to PAID`);

      // Auto-create ClientDomain record if not exists AND we have domain info
      if (order.domain && order.domainName) {
        try {
          const fullDomainName = `${order.domainName}${order.domain?.extension || ''}`;
          const registeredAt = new Date();
          const expiredAt = new Date();
          expiredAt.setDate(expiredAt.getDate() + ((order.package?.duration || 1) * 365));

          const existingDomain = await prisma.clientDomain.findUnique({
            where: { domainName: fullDomainName }
          });

          if (!existingDomain) {
            await prisma.clientDomain.create({
              data: {
                clientEmail: order.customerEmail,
                domainName: fullDomainName,
                registeredAt: registeredAt,
                expiredAt: expiredAt,
                status: 'ACTIVE',
                autoRenew: false,
                notes: `Auto-created from order ${invoiceId}`,
              },
            });
            console.log(`[Confirm Payment] ClientDomain created: ${fullDomainName}`);
          }
        } catch (domainError) {
          console.error('[Confirm Payment] Failed to create ClientDomain:', domainError);
          // Don't fail if domain creation fails
        }
      } else {
        console.warn(`[Confirm Payment] Skipping ClientDomain creation - missing domain info for order ${invoiceId}`);
      }

      return NextResponse.json({ 
        success: true,
        message: 'Payment confirmed and order updated',
      });
    } else {
      console.log(`[Confirm Payment] Order status is ${order.status}, skipping update`);
      return NextResponse.json({ 
        success: true,
        message: `Order already has status: ${order.status}`,
      });
    }

  } catch (error) {
    console.error('[Confirm Payment] Error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}
