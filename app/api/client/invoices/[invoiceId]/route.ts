import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ invoiceId: string }> }
) {
    try {
        const { invoiceId } = await params;
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('client_session');

        if (!sessionCookie) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const session = JSON.parse(sessionCookie.value);

        const order = await prisma.order.findUnique({
            where: {
                invoiceId: invoiceId,
            },
            include: {
                domain: true,
                template: true,
                package: true,
                services: {
                    include: {
                        service: true,
                    },
                },
            },
        });

        if (!order || order.customerEmail !== session.email) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('Get Client Invoice Error:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
