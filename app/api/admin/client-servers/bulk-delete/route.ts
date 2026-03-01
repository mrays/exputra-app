import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/admin/client-servers/bulk-delete
export async function POST(request: NextRequest) {
    try {
        const { ids } = await request.json();

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { message: 'Invalid IDs array' },
                { status: 400 }
            );
        }

        const result = await prisma.clientServer.deleteMany({
            where: {
                id: {
                    in: ids,
                },
            },
        });

        return NextResponse.json({
            message: `Successfully deleted ${result.count} servers`,
            count: result.count,
        });
    } catch (error: any) {
        console.error('Bulk Delete Servers Error:', error);
        return NextResponse.json(
            { message: error.message || 'Failed to delete servers' },
            { status: 500 }
        );
    }
}
