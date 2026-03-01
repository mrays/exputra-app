import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json();

    const promo = await prisma.promo.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo) {
      return NextResponse.json({ valid: false, message: 'Kode promo tidak ditemukan' });
    }

    if (!promo.isActive) {
      return NextResponse.json({ valid: false, message: 'Kode promo tidak aktif' });
    }

    if (promo.expiredAt && new Date(promo.expiredAt) < new Date()) {
      return NextResponse.json({ valid: false, message: 'Kode promo sudah expired' });
    }

    if (subtotal < promo.minTransaction) {
      return NextResponse.json({
        valid: false,
        message: `Minimum transaksi IDR ${promo.minTransaction.toLocaleString('id-ID')}`,
      });
    }

    let discount = 0;
    if (promo.discountType === 'PERCENT') {
      discount = Math.floor(subtotal * promo.discountValue / 100);
      if (promo.maxDiscount && discount > promo.maxDiscount) {
        discount = promo.maxDiscount;
      }
    } else {
      discount = promo.discountValue;
    }

    return NextResponse.json({
      valid: true,
      promo: {
        id: promo.id,
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        discount,
      },
    });
  } catch (error) {
    console.error('Validate Promo Error:', error);
    return NextResponse.json({ valid: false, message: 'Gagal memvalidasi promo' });
  }
}
