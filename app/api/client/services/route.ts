import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('client_session');

    if (!sessionCookie) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const session = JSON.parse(sessionCookie.value);

    // Get all services from all orders of this client
    const services = await prisma.orderService.findMany({
      where: {
        order: {
          customerEmail: session.email,
        },
      },
      include: {
        service: true,
        order: {
          select: {
            id: true,
            invoiceId: true,
            domainName: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        order: {
          createdAt: 'desc',
        },
      },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error('Get Client Services Error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}
