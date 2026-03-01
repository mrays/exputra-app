import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { templateSchema } from '@/lib/validations';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = templateSchema.parse(body);

    const template = await prisma.template.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json(template);
  } catch (error: any) {
    console.error('Update Template Error:', error);
    return NextResponse.json({ message: error.message || 'Failed to update template' }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.template.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Template deleted' });
  } catch (error) {
    console.error('Delete Template Error:', error);
    return NextResponse.json({ message: 'Failed to delete template' }, { status: 500 });
  }
}
