import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { packageSchema } from '@/lib/validations';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = packageSchema.parse(body);

    const { freeDomainIds, freeTemplateIds, ...data } = validated;

    const pkg = await prisma.package.update({
      where: { id },
      data: {
        ...data,
        freeDomains: {
          set: freeDomainIds && freeDomainIds.length > 0
            ? freeDomainIds.map(id => ({ id }))
            : []
        },
        freeTemplates: {
          set: freeTemplateIds && freeTemplateIds.length > 0
            ? freeTemplateIds.map(id => ({ id }))
            : []
        }
      },
    });

    return NextResponse.json(pkg);
  } catch (error: any) {
    console.error('Update Package Error:', error);
    return NextResponse.json({ message: error.message || 'Failed to update package' }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.package.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Package deleted' });
  } catch (error) {
    console.error('Delete Package Error:', error);
    return NextResponse.json({ message: 'Failed to delete package' }, { status: 500 });
  }
}
