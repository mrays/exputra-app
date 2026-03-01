import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { domainSchema } from '@/lib/validations';

export async function GET() {
  try {
    const domains = await prisma.domain.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(domains);
  } catch (error) {
    console.error('Get Domains Error:', error);
    return NextResponse.json({ message: 'Failed to fetch domains' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = domainSchema.parse(body);

    const domain = await prisma.domain.create({
      data: validated,
    });

    return NextResponse.json(domain, { status: 201 });
  } catch (error: any) {
    console.error('Create Domain Error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'Extension sudah ada' }, { status: 400 });
    }
    return NextResponse.json({ message: error.message || 'Failed to create domain' }, { status: 400 });
  }
}
