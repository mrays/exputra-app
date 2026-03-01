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

        const { email } = JSON.parse(session.value);

        const servers = await prisma.clientServer.findMany({
            where: { clientEmail: email },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(servers);
    } catch (error) {
        console.error('Fetch Client Servers Error:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
