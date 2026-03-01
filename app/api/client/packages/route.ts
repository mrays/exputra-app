import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('client_session');

        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { customerId, email: sessionEmail } = JSON.parse(session.value);

        // Fetch fresh customer data to get the current email
        const customer = await prisma.customer.findUnique({
            where: { id: customerId },
            select: { email: true }
        });

        const searchEmail = customer?.email || sessionEmail;

        const orders = await prisma.order.findMany({
            where: { customerEmail: searchEmail },
            include: {
                package: true,
                domain: true,
                template: true,
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error('Fetch Client Packages Error:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
