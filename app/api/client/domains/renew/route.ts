import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

interface RenewRequest {
    domainId: string;
    domainName: string;
    renewalPrice: number;
    years?: number;
}

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('client_session');

        if (!sessionCookie) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const session = JSON.parse(sessionCookie.value);
        const { domainId, domainName, renewalPrice, years = 1 }: RenewRequest = await request.json();

        // Validate input
        if (!domainId || !domainName || !renewalPrice) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Verify domain exists and belongs to customer
        const domain = await prisma.domain.findUnique({
            where: { id: domainId }
        });

        if (!domain) {
            return NextResponse.json(
                { message: 'Domain not found' },
                { status: 404 }
            );
        }

        // Get or create a renewal package (standard 1 year renewal)
        let renewalPackage = await prisma.package.findFirst({
            where: {
                name: 'Domain Renewal (1 Year)'
            }
        });

        if (!renewalPackage) {
            renewalPackage = await prisma.package.create({
                data: {
                    name: 'Domain Renewal (1 Year)',
                    price: renewalPrice,
                    price1Year: renewalPrice,
                    duration: 1,
                    features: 'Domain renewal for 1 year',
                    isActive: true,
                    freeDomain: false,
                    freeTemplate: false
                }
            });
        }

        // Get customer info
        const customer = await prisma.customer.findUnique({
            where: { email: session.email }
        });

        if (!customer) {
            return NextResponse.json(
                { message: 'Customer not found' },
                { status: 404 }
            );
        }

        // Generate Invoice ID
        const now = new Date();
        const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '');
        const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
        const invoiceId = `INV-${dateStr}-${timeStr}${Math.floor(Math.random() * 100)}`;

        // Get a default template or use first available
        let defaultTemplate = await prisma.template.findFirst({
            where: { isActive: true }
        });

        if (!defaultTemplate) {
            return NextResponse.json(
                { message: 'No template available for invoice' },
                { status: 400 }
            );
        }

        // Create order for domain renewal
        const order = await prisma.order.create({
            data: {
                invoiceId,
                customerEmail: session.email,
                customerName: customer.name,
                customerPhone: customer.phone || '-',
                domainName,
                domainId,
                templateId: defaultTemplate.id,
                packageId: renewalPackage.id,
                subtotal: renewalPrice,
                discount: 0,
                total: renewalPrice,
                status: 'PENDING',
            },
            include: {
                domain: true,
                template: true,
                package: true,
            }
        });

        // Return invoice data with redirect info
        return NextResponse.json({
            success: true,
            invoiceId: order.invoiceId,
            data: order,
            message: 'Invoice created successfully. Redirecting to payment...'
        }, { status: 201 });

    } catch (error) {
        console.error('Domain Renewal Error:', error);
        return NextResponse.json(
            { message: error instanceof Error ? error.message : 'Failed to create renewal invoice' },
            { status: 500 }
        );
    }
}
