import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const serverSchema = z.object({
    clientEmail: z.string().min(1),
    serverName: z.string().min(1),
    ipAddress: z.string().min(1),
    location: z.string().min(1),
    serverType: z.enum(['SHARED', 'VPS', 'DEDICATED', 'CLOUD']),
    status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']).optional(),
    expiredAt: z.string().optional().or(z.null()),
});

// GET /api/admin/client-servers/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const server = await prisma.clientServer.findUnique({
            where: { id },
            include: {
                client: true,
                domains: {
                    include: {
                        domain: true,
                    },
                },
            },
        });

        if (!server) {
            return NextResponse.json(
                { message: 'Server not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(server);
    } catch (error: any) {
        console.error('Get Server Error:', error);
        return NextResponse.json(
            { message: error.message || 'Failed to fetch server' },
            { status: 500 }
        );
    }
}

// PUT /api/admin/client-servers/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const validated = serverSchema.partial().parse(body);

        const dataToUpdate: any = { ...validated };
        if (validated.expiredAt !== undefined) {
            dataToUpdate.expiredAt = validated.expiredAt ? new Date(validated.expiredAt) : null;
        }

        const server = await prisma.clientServer.update({
            where: { id },
            data: dataToUpdate,
        });

        return NextResponse.json(server);
    } catch (error: any) {
        console.error('Update Server Error:', error);
        return NextResponse.json(
            { message: error.message || 'Failed to update server' },
            { status: 400 }
        );
    }
}

// DELETE /api/admin/client-servers/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await prisma.clientServer.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Server deleted successfully' });
    } catch (error: any) {
        console.error('Delete Server Error:', error);
        return NextResponse.json(
            { message: error.message || 'Failed to delete server' },
            { status: 500 }
        );
    }
}
