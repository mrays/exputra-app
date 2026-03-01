import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [
      totalDomains,
      totalTemplates,
      totalPackages,
      totalServices,
      totalPromos,
      totalOrders,
      pendingOrders,
      revenueResult,
    ] = await Promise.all([
      prisma.domain.count({ where: { isActive: true } }),
      prisma.template.count({ where: { isActive: true } }),
      prisma.package.count({ where: { isActive: true } }),
      prisma.service.count({ where: { isActive: true } }),
      prisma.promo.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.aggregate({
        where: { status: 'PAID' },
        _sum: { total: true },
      }),
    ]);

    return NextResponse.json({
      totalDomains,
      totalTemplates,
      totalPackages,
      totalServices,
      totalPromos,
      totalOrders,
      pendingOrders,
      totalRevenue: revenueResult._sum.total || 0,
    });
  } catch (error) {
    console.error('Stats Error:', error);
    return NextResponse.json({
      totalDomains: 0,
      totalTemplates: 0,
      totalPackages: 0,
      totalServices: 0,
      totalPromos: 0,
      totalOrders: 0,
      pendingOrders: 0,
      totalRevenue: 0,
    });
  }
}
