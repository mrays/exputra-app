import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { getInvoiceTemplate } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { packageId } = body;

    if (!packageId) {
      return NextResponse.json(
        { message: 'packageId is required' },
        { status: 400 }
      );
    }

    // Fetch current order and new package with full details
    const [order, newPackage] = await Promise.all([
      prisma.order.findUnique({
        where: { id },
        include: {
          package: true,
          domain: true,
          template: true,
          services: {
            include: {
              service: true,
            },
          },
        },
      }),
      prisma.package.findUnique({
        where: { id: packageId },
      }),
    ]);

    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    if (!newPackage) {
      return NextResponse.json(
        { message: 'Package not found' },
        { status: 404 }
      );
    }

    // Calculate price difference
    const oldPackagePrice = order.package?.price || 0;
    const newPackagePrice = newPackage.price || 0;
    const priceDifference = newPackagePrice - oldPackagePrice;

    // Generate new invoice ID for upgrade order
    const upgradeInvoiceId = `INV-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    // Create NEW order for upgrade (not update existing)
    const upgradeOrder = await prisma.order.create({
      data: {
        invoiceId: upgradeInvoiceId,
        domainName: order.domainName,
        domainId: order.domainId,
        templateId: order.templateId,
        packageId: packageId,
        promoId: order.promoId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        subtotal: priceDifference > 0 ? priceDifference : 0,
        discount: 0,
        total: priceDifference > 0 ? priceDifference : 0,
        paymentMethod: null,
        paymentRef: `UPGRADE_FROM_${order.invoiceId}`,
        status: 'PENDING', // Upgrade invoice waiting for payment
        paidAt: null,
      },
      include: {
        package: true,
        domain: true,
        template: true,
      },
    });

    // Send invoice email for upgrade order
    try {
      const fullDomainName = `${order.domainName}${order.domain?.extension || ''}`;
      const invoiceHtml = getInvoiceTemplate(
        upgradeOrder.invoiceId,
        upgradeOrder.customerName,
        upgradeOrder.customerEmail,
        upgradeOrder.customerPhone,
        fullDomainName,
        upgradeOrder.package?.name || 'N/A',
        upgradeOrder.template?.name || 'N/A',
        upgradeOrder.subtotal,
        upgradeOrder.discount,
        upgradeOrder.total,
        true, // isUpgrade
        priceDifference,
        oldPackagePrice,
        newPackagePrice
      );

      await sendEmail({
        to: upgradeOrder.customerEmail,
        subject: `📋 Invoice Upgrade Paket - ${upgradeOrder.invoiceId}`,
        html: invoiceHtml,
      });

      console.log(`✓ Invoice email sent to ${upgradeOrder.customerEmail} for upgrade order ${upgradeOrder.invoiceId}`);
    } catch (emailError) {
      console.error('Failed to send invoice email:', emailError);
      // Don't fail the API response if email fails
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Package upgraded successfully',
        data: {
          originalOrder: order,
          upgradeOrder: upgradeOrder,
          priceDifference,
          oldPrice: oldPackagePrice,
          newPrice: newPackagePrice,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Upgrade Package Error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to upgrade package' },
      { status: 500 }
    );
  }
}
