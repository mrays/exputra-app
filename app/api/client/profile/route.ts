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

        const { customerId } = JSON.parse(session.value);

        const customer = await prisma.customer.findUnique({
            where: { id: customerId },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                whatsapp: true,
                company: true,
                address: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        if (!customer) {
            return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
        }

        return NextResponse.json(customer);
    } catch (error) {
        console.error('Fetch Profile Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('client_session');

        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { customerId, email } = JSON.parse(session.value);
        const body = await request.json();

        // Minimal validation
        if (!body.name || !body.email) {
            return NextResponse.json({ message: 'Nama dan Email wajib diisi' }, { status: 400 });
        }

        const updatedCustomer = await prisma.customer.update({
            where: { id: customerId },
            data: {
                name: body.name,
                email: body.email.toLowerCase(),
                phone: body.phone,
                whatsapp: body.whatsapp,
                company: body.company,
                address: body.address,
            }
        });

        // Update session if email or name changed
        if (updatedCustomer.email !== email || updatedCustomer.name !== JSON.parse(session.value).name) {
            cookieStore.set('client_session', JSON.stringify({
                customerId: updatedCustomer.id,
                email: updatedCustomer.email,
                name: updatedCustomer.name,
            }), {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7,
            });
        }

        return NextResponse.json(updatedCustomer);
    } catch (error: any) {
        console.error('Update Profile Error:', error);
        return NextResponse.json({ message: error.message || 'Error updating profile' }, { status: 500 });
    }
}
