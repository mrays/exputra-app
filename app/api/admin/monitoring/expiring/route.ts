import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/admin/monitoring/expiring - Get expiring domains
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30');

        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);

        const domains = await prisma.clientDomain.findMany({
            where: {
                expiredAt: {
                    lte: futureDate,
                    gte: new Date(),
                },
                status: 'ACTIVE',
            },
            include: {
                client: {
                    select: {
                        email: true,
                        name: true,
                        company: true,
                        phone: true,
                    },
                },
            },
            orderBy: { expiredAt: 'asc' },
        });

        return NextResponse.json(domains);
    } catch (error: any) {
        console.error('Get Expiring Domains Error:', error);
        return NextResponse.json(
            { message: error.message || 'Failed to fetch expiring domains' },
            { status: 500 }
        );
    }
}
