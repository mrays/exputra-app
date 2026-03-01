import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { promoSchema } from '@/lib/validations';

export async function GET() {
  try {
    const promos = await prisma.promo.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(promos);
  } catch (error) {
    console.error('Get Promos Error:', error);
    return NextResponse.json({ message: 'Failed to fetch promos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = promoSchema.parse(body);

    const promo = await prisma.promo.create({
      data: {
        ...validated,
        expiredAt: validated.expiredAt ? new Date(validated.expiredAt) : null,
      },
    });

    return NextResponse.json(promo, { status: 201 });
  } catch (error: any) {
    console.error('Create Promo Error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'Kode promo sudah ada' }, { status: 400 });
    }
    return NextResponse.json({ message: error.message || 'Failed to create promo' }, { status: 400 });
  }
}
