import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderIds } = body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { message: 'orderIds array is required' },
        { status: 400 }
      );
    }

    // Fetch completed/paid orders
    const orders = await prisma.order.findMany({
      where: {
        id: { in: orderIds },
        status: { in: ['PAID', 'COMPLETED'] },
      },
      include: {
        domain: true,
      },
    });

    if (orders.length === 0) {
      return NextResponse.json(
        { message: 'No valid completed/paid orders found' },
        { status: 400 }
      );
    }

    const addedDomains = [];
    const skippedDomains = [];

    for (const order of orders) {
      // Check if domain already exists
      const existingDomain = await prisma.clientDomain.findUnique({
        where: { domainName: order.domainName },
      });

      if (existingDomain) {
        skippedDomains.push({
          domainName: order.domainName,
          reason: 'Domain already exists',
        });
        continue;
      }

      // Create new ClientDomain from Order
      const registeredAt = order.paidAt || order.createdAt;
      const expiredAt = new Date(registeredAt);
      
      // Add duration from package to calculate expiry date
      const orderWithPackage = await prisma.order.findUnique({
        where: { id: order.id },
        include: { package: true },
      });

      if (orderWithPackage?.package) {
        expiredAt.setFullYear(expiredAt.getFullYear() + orderWithPackage.package.duration);
      }

      try {
        const clientDomain = await prisma.clientDomain.create({
          data: {
            clientEmail: order.customerEmail,
            domainName: order.domainName,
            registeredAt: registeredAt as Date,
            expiredAt,
            status: 'ACTIVE',
            autoRenew: false,
            notes: `Auto-added from Order ${order.invoiceId}`,
          },
        });

        addedDomains.push({
          id: clientDomain.id,
          domainName: clientDomain.domainName,
          clientEmail: clientDomain.clientEmail,
        });
      } catch (error: any) {
        skippedDomains.push({
          domainName: order.domainName,
          reason: error.message,
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Added ${addedDomains.length} domain(s)`,
        addedDomains,
        skippedDomains,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Auto-add domains error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to auto-add domains' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch available completed orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientEmail = searchParams.get('clientEmail');

    const where: any = {
      status: { in: ['PAID', 'COMPLETED'] },
    };

    if (clientEmail) {
      where.customerEmail = clientEmail;
    }

    // Get orders that don't already have corresponding client domains
    const completedOrders = await prisma.order.findMany({
      where,
      include: {
        package: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter out orders that already have client domains
    const availableOrders = [];
    for (const order of completedOrders) {
      try {
        const existingDomain = await prisma.clientDomain.findUnique({
          where: { domainName: order.domainName },
        });
        if (!existingDomain) {
          availableOrders.push(order);
        }
      } catch (checkError) {
        console.error(`Error checking domain ${order.domainName}:`, checkError);
        // Continue processing other orders
      }
    }

    return NextResponse.json(availableOrders, { status: 200 });
  } catch (error: any) {
    console.error('Fetch available orders error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch orders', availableOrders: [] },
      { status: 200 }
    );
  }
}
