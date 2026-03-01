import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { templateSchema } from '@/lib/validations';

export async function GET() {
  try {
    const templates = await prisma.template.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Get Templates Error:', error);
    return NextResponse.json({ message: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = templateSchema.parse(body);

    const template = await prisma.template.create({
      data: validated,
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error: any) {
    console.error('Create Template Error:', error);
    return NextResponse.json({ message: error.message || 'Failed to create template' }, { status: 400 });
  }
}
