import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/admin/monitoring/domains - Get all domains with full relations
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const includeExpired = searchParams.get('includeExpired') === 'true';

        const where: any = {};

        if (!includeExpired) {
            where.status = {
                not: 'EXPIRED',
            };
        }

        const domains = await prisma.clientDomain.findMany({
            where,
            include: {
                client: {
                    select: {
                        email: true,
                        name: true,
                        company: true,
                        status: true,
                    },
                },
                servers: {
                    include: {
                        server: {
                            select: {
                                id: true,
                                serverName: true,
                                ipAddress: true,
                                serverType: true,
                                status: true,
                            },
                        },
                    },
                },
            },
            orderBy: { expiredAt: 'asc' },
        });

        return NextResponse.json(domains);
    } catch (error: any) {
        console.error('Get Monitoring Domains Error:', error);
        return NextResponse.json(
            { message: error.message || 'Failed to fetch monitoring data' },
            { status: 500 }
        );
    }
}
