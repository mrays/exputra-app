import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/admin/monitoring/stats - Get statistics
export async function GET() {
    try {
        const [
            totalClients,
            activeClients,
            totalDomains,
            activeDomains,
            expiringDomains,
            totalServers,
            activeServers,
            totalRegistrars,
            activeRegistrars,
        ] = await Promise.all([
            prisma.customer.count(),
            prisma.customer.count({ where: { status: 'ACTIVE' } }),
            prisma.clientDomain.count(),
            prisma.clientDomain.count({ where: { status: 'ACTIVE' } }),
            prisma.clientDomain.count({
                where: {
                    expiredAt: {
                        lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                        gte: new Date(),
                    },
                    status: 'ACTIVE',
                },
            }),
            prisma.clientServer.count(),
            prisma.clientServer.count({ where: { status: 'ACTIVE' } }),
            prisma.domainRegistrar.count(),
            prisma.domainRegistrar.count({ where: { isActive: true } }),
        ]);

        // Domain by registrar
        const domainsByRegistrar = await prisma.clientDomain.groupBy({
            by: ['registrar'],
            _count: true,
            orderBy: {
                _count: {
                    registrar: 'desc',
                },
            },
        });

        // Server by type
        const serversByType = await prisma.clientServer.groupBy({
            by: ['serverType'],
            _count: true,
        });

        return NextResponse.json({
            clients: {
                total: totalClients,
                active: activeClients,
                inactive: totalClients - activeClients,
            },
            domains: {
                total: totalDomains,
                active: activeDomains,
                expiring: expiringDomains,
                expired: totalDomains - activeDomains,
                byRegistrar: domainsByRegistrar.map((item) => ({
                    registrar: item.registrar,
                    count: item._count,
                })),
            },
            servers: {
                total: totalServers,
                active: activeServers,
                inactive: totalServers - activeServers,
                byType: serversByType.map((item) => ({
                    type: item.serverType,
                    count: item._count,
                })),
            },
            registrars: {
                total: totalRegistrars,
                active: activeRegistrars,
                inactive: totalRegistrars - activeRegistrars,
            },
        });
    } catch (error: any) {
        console.error('Get Stats Error:', error);
        return NextResponse.json(
            { message: error.message || 'Failed to fetch statistics' },
            { status: 500 }
        );
    }
}
