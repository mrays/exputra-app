import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { clientSchema } from '@/lib/validations';

// GET /api/admin/clients/[email] - Get client by email
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ email: string }> }
) {
    try {
        const { email } = await params;
        const decodedEmail = decodeURIComponent(email);

        const client = await prisma.customer.findUnique({
            where: { email: decodedEmail },
            include: {
                domains: {
                    include: {
                        servers: {
                            include: {
                                server: true,
                            },
                        },
                    },
                },
                servers: {
                    include: {
                        domains: {
                            include: {
                                domain: true,
                            },
                        },
                    },
                },
            },
        });

        if (!client) {
            return NextResponse.json(
                { message: 'Client not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(client);
    } catch (error: any) {
        console.error('Get Client Error:', error);
        return NextResponse.json(
            { message: error.message || 'Failed to fetch client' },
            { status: 500 }
        );
    }
}

// PUT /api/admin/clients/[email] - Update client
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ email: string }> }
) {
    try {
        const { email } = await params;
        const decodedEmail = decodeURIComponent(email);
        const body = await request.json();
        
        // Create a custom schema for updates (exclude email from validation)
        const updateSchema = clientSchema.partial().omit({ email: true });
        const validated = updateSchema.parse(body);
        const { password, ...customerData } = validated;

        const client = await prisma.$transaction(async (tx) => {
            // 1. Update Customer with password sync if provided
            const updateData: any = customerData;
            if (password) {
                // Store password in phone field for client login
                updateData.phone = password;
            }

            const updatedClient = await tx.customer.update({
                where: { email: decodedEmail },
                data: updateData,
            });

            // 2. Handle password update
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                
                // Check if user exists
                const existingUser = await tx.user.findUnique({
                    where: { email: decodedEmail },
                });

                if (existingUser) {
                    // Update existing user password
                    await tx.user.update({
                        where: { email: decodedEmail },
                        data: { password: hashedPassword },
                    });
                } else {
                    // Create new user if doesn't exist
                    await tx.user.create({
                        data: {
                            email: decodedEmail,
                            password: hashedPassword,
                            name: updatedClient.name || 'User',
                        },
                    });
                }
            }

            return updatedClient;
        });

        return NextResponse.json(client);
    } catch (error: any) {
        console.error('Update Client Error:', error);
        return NextResponse.json(
            { message: error.message || 'Failed to update client' },
            { status: 400 }
        );
    }
}

// DELETE /api/admin/clients/[email] - Delete client (cascade)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ email: string }> }
) {
    try {
        const { email } = await params;
        const decodedEmail = decodeURIComponent(email);

        await prisma.customer.delete({
            where: { email: decodedEmail },
        });

        return NextResponse.json({ message: 'Client deleted successfully' });
    } catch (error: any) {
        console.error('Delete Client Error:', error);
        return NextResponse.json(
            { message: error.message || 'Failed to delete client' },
            { status: 500 }
        );
    }
}
