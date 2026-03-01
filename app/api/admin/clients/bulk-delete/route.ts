import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/admin/clients/bulk-delete - Bulk delete clients
export async function POST(request: NextRequest) {
    try {
        const { emails } = await request.json();

        if (!Array.isArray(emails) || emails.length === 0) {
            return NextResponse.json(
                { message: 'Invalid emails array' },
                { status: 400 }
            );
        }

        const result = await prisma.customer.deleteMany({
            where: {
                email: {
                    in: emails,
                },
            },
        });

        return NextResponse.json({
            message: `Successfully deleted ${result.count} clients`,
            count: result.count,
        });
    } catch (error: any) {
        console.error('Bulk Delete Clients Error:', error);
        return NextResponse.json(
            { message: error.message || 'Failed to delete clients' },
            { status: 500 }
        );
    }
}
