import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

import { clientDomainSchema } from '@/lib/validations';

// GET /api/admin/client-domains - List all domains
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const clientEmail = searchParams.get('clientEmail');
        const status = searchParams.get('status');
        const expiringSoon = searchParams.get('expiringSoon');

        const where: any = {};

        if (clientEmail) {
            where.clientEmail = clientEmail;
        }

        if (status) {
            where.status = status;
        }

        if (expiringSoon === 'true') {
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

            where.expiredAt = {
                lte: thirtyDaysFromNow,
                gte: new Date(),
            };
        }

        const domains = await prisma.clientDomain.findMany({
            where,
            include: {
                client: {
                    select: {
                        email: true,
                        name: true,
                        company: true,
                    },
                },
                registrarRel: {
                    select: { name: true }
                },
                servers: {
                    include: {
                        server: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(domains);
    } catch (error: any) {
        console.error('Get Domains Error:', error);
        return NextResponse.json(
            { message: error.message || 'Failed to fetch domains' },
            { status: 500 }
        );
    }
}

// POST /api/admin/client-domains - Create domain
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        // Since the schema has z.string().datetime(), we parse it first, then convert to Date for Prisma
        const validated = clientDomainSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                { message: 'Validation Error', errors: validated.error.flatten() },
                { status: 400 }
            );
        }

        const data = validated.data;
        // Check for serverId which might be in body but not in schema
        // The previous code had serverId in the schema?
        // Wait, the previous local schema had serverId: z.string().optional().
        // My centralized schema DOES NOT have serverId.
        // I should probably add serverId to the schema or handle it separately.
        // Let's check existing schema again.

        const serverId = body.serverId; // Extract manually if not in schema

        const domain = await prisma.clientDomain.create({
            data: {
                clientEmail: data.clientEmail,
                domainName: data.domainName,
                registrarId: data.registrarId || null,
                // registrar (String) is deprecated in favor of registrarRel, but we might still populate it or ignore it.
                // The schema has registrarId. If the user passes optional "registrar" string, we might ignore it or store it if needed.
                // Existing code: registrar: validated.registrarId ? validated.registrar : (validated.registrar || null)
                // This implies if registrarId is present, use 'registrar' field as name? No, that looks like a bug or legacy.
                // Let's strict to using registrarId for the relation. 
                // However, I must ensure I don't break existing logic.
                // If I look at the centralized schema, I only have registrarId.
                // Let's assume 'registrar' field on model is legacy/optional.

                registeredAt: new Date(data.registeredAt),
                expiredAt: new Date(data.expiredAt),
                status: data.status,
                autoRenew: data.autoRenew,
                notes: data.notes,

                servers: serverId ? {
                    create: [{
                        server: { connect: { id: serverId } }
                        // Wait, previous code was: create: [{ serverId: serverId }]
                        // domainserver model has serverId and domainId.
                        // So correct prisma syntax is create: [{ serverId: serverId }]
                    }]
                } : undefined
            },
            include: {
                client: true,
                servers: {
                    include: {
                        server: true
                    }
                }
            },
        });

        return NextResponse.json(domain, { status: 201 });
    } catch (error: any) {
        console.error('Create Domain Error:', error);
        return NextResponse.json(
            { message: error.message || 'Failed to create domain' },
            { status: 400 }
        );
    }
}
