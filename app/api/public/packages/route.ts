import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const packages = await prisma.package.findMany({
      where: { isActive: true },
      include: {
        freeDomains: true
      },
      orderBy: { duration: 'asc' },
    });
    return NextResponse.json(packages);
  } catch (error) {
    console.error('Get Public Packages Error:', error);
    return NextResponse.json([]);
  }
}
