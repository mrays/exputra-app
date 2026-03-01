import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

import { domainRegistrarSchema } from '@/lib/validations';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const validated = domainRegistrarSchema.partial().parse(body);

        const dataToUpdate: any = { ...validated };
        if (validated.expiredAt !== undefined) {
            // In schema it is z.string().datetime(), validation parses it.
            // Prisma expects Date object?
            // If schema uses z.string().datetime(), the output 'validated.expiredAt' is a string.
            // We need new Date(validated.expiredAt).
            // However, checks if it is null?
            dataToUpdate.expiredAt = validated.expiredAt ? new Date(validated.expiredAt) : null;
        }

        const registrar = await prisma.domainRegistrar.update({
            where: { id },
            data: dataToUpdate,
        });
        return NextResponse.json(registrar);
    } catch (error: any) {
        console.error('Update Registrar Error:', error);
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.domainRegistrar.delete({
            where: { id }
        });
        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error: any) {
        console.error('Delete Registrar Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
