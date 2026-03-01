import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

import { clientServerSchema } from '@/lib/validations';

// GET /api/admin/client-servers - List all servers
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const clientEmail = searchParams.get('clientEmail');
        const serverType = searchParams.get('serverType');
        const status = searchParams.get('status');

        const where: any = {};

        if (clientEmail) {
            where.clientEmail = clientEmail;
        }

        if (serverType) {
            where.serverType = serverType;
        }

        if (status) {
            where.status = status;
        }

        const servers = await prisma.clientServer.findMany({
            where,
            include: {
                client: {
                    select: {
                        email: true,
                        name: true,
                        company: true,
                    },
                },
                domains: {
                    include: {
                        domain: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(servers);
    } catch (error: any) {
        console.error('Get Servers Error:', error);
        return NextResponse.json(
            { message: error.message || 'Failed to fetch servers' },
            { status: 500 }
        );
    }
}

// POST /api/admin/client-servers - Create server
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validated = clientServerSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                { message: 'Validation Error', errors: validated.error.flatten() },
                { status: 400 }
            );
        }

        const data = validated.data;

        const server = await prisma.clientServer.create({
            data: {
                clientEmail: data.clientEmail,
                serverName: data.serverName,
                ipAddress: data.ipAddress,
                location: data.location,
                serverType: data.serverType,
                status: data.status,
                expiredAt: data.expiredAt ? new Date(data.expiredAt) : null,
                username: data.username,
                password: data.password,
                loginUrl: data.loginUrl,
                notes: data.notes,
            },
            include: {
                client: true,
            },
        });

        return NextResponse.json(server, { status: 201 });
    } catch (error: any) {
        console.error('Create Server Error:', error);
        return NextResponse.json(
            { message: error.message || 'Failed to create server' },
            { status: 400 }
        );
    }
}
