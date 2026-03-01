import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

import { domainRegistrarSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
    try {
        const registrars = await prisma.domainRegistrar.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { domains: true }
                }
            }
        });
        return NextResponse.json(registrars);
    } catch (error: any) {
        console.error('Get Registrars Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validated = domainRegistrarSchema.parse(body);

        const registrar = await prisma.domainRegistrar.create({
            data: {
                name: validated.name,
                username: validated.username,
                password: validated.password,
                loginUrl: validated.loginUrl,
                notes: validated.notes,
                expiredAt: validated.expiredAt ? new Date(validated.expiredAt) : null,
            }
        });
        return NextResponse.json(registrar, { status: 201 });
    } catch (error: any) {
        console.error('Create Registrar Error:', error);
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
