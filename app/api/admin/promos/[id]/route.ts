import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { promoSchema } from '@/lib/validations';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = promoSchema.parse(body);

    const promo = await prisma.promo.update({
      where: { id },
      data: {
        ...validated,
        expiredAt: validated.expiredAt ? new Date(validated.expiredAt) : null,
      },
    });

    return NextResponse.json(promo);
  } catch (error: any) {
    console.error('Update Promo Error:', error);
    return NextResponse.json({ message: error.message || 'Failed to update promo' }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.promo.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Promo deleted' });
  } catch (error) {
    console.error('Delete Promo Error:', error);
    return NextResponse.json({ message: 'Failed to delete promo' }, { status: 500 });
  }
}
