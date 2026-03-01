import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const domains = await prisma.domain.findMany({
      where: { isActive: true },
      orderBy: [
        { label: 'desc' }, // Show labeled items first (non-null)
        { price: 'asc' },
      ],
    });
    return NextResponse.json(domains);
  } catch (error) {
    console.error('Get Public Domains Error:', error);
    return NextResponse.json([]);
  }
}
