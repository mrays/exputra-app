import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, phone } = await request.json();

    if (!email || !phone) {
      return NextResponse.json(
        { message: 'Email dan nomor HP wajib diisi' },
        { status: 400 }
      );
    }

    // 1. Check Customer table first (Primary Authentication)
    let customer = await prisma.customer.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (customer) {
      // If customer exists, verify phone matches
      if (customer.phone !== phone) {
        return NextResponse.json(
          { message: 'Nomor HP tidak sesuai dengan email yang terdaftar' },
          { status: 401 }
        );
      }
    } else {
      // 2. Fallback: Check Orders (for first time login or legacy support)
      const orders = await prisma.order.findMany({
        where: {
          customerEmail: email.toLowerCase(),
          customerPhone: phone,
        },
        include: {
          domain: true, // Keep includes if needed by logic, though we just need existence here or name
        },
      });

      if (orders.length === 0) {
        return NextResponse.json(
          { message: 'Email atau nomor HP tidak ditemukan' },
          { status: 401 }
        );
      }

      // Create new customer from Order data
      customer = await prisma.customer.create({
        data: {
          email: email.toLowerCase(),
          phone: phone,
          name: orders[0].customerName,
        },
      });
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('client_session', JSON.stringify({
      customerId: customer.id,
      email: customer.email,
      name: customer.name,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
      },
    });
  } catch (error) {
    console.error('Client Login Error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat login' },
      { status: 500 }
    );
  }
}
