import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function PUT(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('client_session');

        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { email } = JSON.parse(session.value);
        const { currentPassword, newPassword } = await request.json();

        if (!newPassword || newPassword.length < 6) {
            return NextResponse.json({ message: 'Nomor HP baru minimal 6 karakter' }, { status: 400 });
        }

        // Find the customer
        const customer = await prisma.customer.findUnique({
            where: { email },
            include: { user: true }
        });

        if (!customer) {
            return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
        }

        // Check current phone number matches
        if (currentPassword !== customer.phone) {
            return NextResponse.json({ message: 'Nomor HP saat ini salah' }, { status: 400 });
        }

        // Update phone number and password field (phone number as password)
        await prisma.customer.update({
            where: { id: customer.id },
            data: { phone: newPassword }
        });

        // Also update the user password field if user exists
        if (customer.user) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await prisma.user.update({
                where: { id: customer.user.id },
                data: { password: hashedPassword }
            });
        }

        return NextResponse.json({ success: true, message: 'Nomor HP berhasil diperbarui' });
    } catch (error: any) {
        console.error('Update Password Error:', error);
        return NextResponse.json({ message: error.message || 'Error updating password' }, { status: 500 });
    }
}
