import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { domainSchema } from '@/lib/validations';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = domainSchema.parse(body);

    const domain = await prisma.domain.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json(domain);
  } catch (error: any) {
    console.error('Update Domain Error:', error);
    return NextResponse.json({ message: error.message || 'Failed to update domain' }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.domain.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Domain deleted' });
  } catch (error) {
    console.error('Delete Domain Error:', error);
    return NextResponse.json({ message: 'Failed to delete domain' }, { status: 500 });
  }
}
