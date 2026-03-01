import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { serviceSchema } from '@/lib/validations';

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(services);
  } catch (error) {
    console.error('Get Services Error:', error);
    return NextResponse.json({ message: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = serviceSchema.parse(body);

    const service = await prisma.service.create({
      data: validated,
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error: any) {
    console.error('Create Service Error:', error);
    return NextResponse.json({ message: error.message || 'Failed to create service' }, { status: 400 });
  }
}
