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

        const domains = await prisma.clientDomain.findMany({
            where: { clientEmail: searchEmail },
            orderBy: { expiredAt: 'asc' }
        });

        return NextResponse.json(domains);
    } catch (error) {
        console.error('Fetch Client Domains Error:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
