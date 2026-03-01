import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { clientSchema } from '@/lib/validations';

// GET /api/admin/clients - List all clients
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        const where: any = {};

        if (status) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { email: { contains: search } },
                { name: { contains: search } },
                { company: { contains: search } },
            ];
        }

        const clients = await prisma.customer.findMany({
            where,
            include: {
                domains: {
                    select: {
                        id: true,
                        domainName: true,
                        status: true,
                    },
                },
                servers: {
                    select: {
                        id: true,
                        serverName: true,
                        status: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(clients);
    } catch (error: any) {
        console.error('Get Clients Error:', error);
        return NextResponse.json(
            { message: error.message || 'Failed to fetch clients' },
            { status: 500 }
        );
    }
}

// POST /api/admin/clients - Create client
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Handle empty string userId
        if (body.userId === '') {
            body.userId = null;
        }

        const validated = clientSchema.parse(body);
        const { password, ...customerData } = validated;

        // If password provided, sync it with phone field for login
        if (password && !customerData.phone) {
            customerData.phone = password;
        }

        // Create customer
        const client = await prisma.customer.create({
            data: customerData,
        });

        // If password provided, create User record
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await prisma.user.create({
                data: {
                    email: client.email,
                    name: client.name || 'User',
                    password: hashedPassword,
                },
            });
        }

        return NextResponse.json(client, { status: 201 });
    } catch (error: any) {
        console.error('Create Client Error:', error);

        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
            return NextResponse.json(
                { message: 'This email is already registered.' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { message: error.message || 'Failed to create client' },
            { status: 400 }
        );
    }
}
