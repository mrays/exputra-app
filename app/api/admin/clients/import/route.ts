import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { data } = await request.json();

        console.log(`[Import Clients] Starting import with ${data?.length || 0} rows`);

        if (!Array.isArray(data) || data.length === 0) {
            console.warn('[Import Clients] Invalid or empty data');
            return NextResponse.json(
                { message: 'Data tidak valid atau kosong' },
                { status: 400 }
            );
        }

        let successCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        for (let index = 0; index < data.length; index++) {
            const row = data[index];
            try {
                // Validate required fields
                if (!row.email || !row.name || !row.phone) {
                    errorCount++;
                    const errorMsg = `Baris ${index + 1}: Harus memiliki email, name, dan phone`;
                    errors.push(errorMsg);
                    console.warn(`[Import Clients] ${errorMsg}`);
                    continue;
                }

                // Check if customer already exists
                const existingCustomer = await prisma.customer.findUnique({
                    where: { email: row.email },
                });

                if (existingCustomer) {
                    // Update existing customer
                    await prisma.customer.update({
                        where: { email: row.email },
                        data: {
                            name: row.name || existingCustomer.name,
                            phone: String(row.phone) || existingCustomer.phone,
                            whatsapp: row.whatsapp || existingCustomer.whatsapp,
                            company: row.company || existingCustomer.company,
                            address: row.address || existingCustomer.address,
                            status: row.status || existingCustomer.status,
                            notes: row.notes || existingCustomer.notes,
                        },
                    });
                    console.log(`[Import Clients] Updated customer: ${row.email}`);
                } else {
                    // Create new customer
                    await prisma.customer.create({
                        data: {
                            email: row.email,
                            name: row.name,
                            phone: String(row.phone),
                            whatsapp: row.whatsapp || undefined,
                            company: row.company || undefined,
                            address: row.address || undefined,
                            status: row.status || 'ACTIVE',
                            notes: row.notes || undefined,
                        },
                    });
                    console.log(`[Import Clients] Created customer: ${row.email}`);
                }

                successCount++;
            } catch (error) {
                errorCount++;
                const errorMsg = `Baris ${index + 1}: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`;
                errors.push(errorMsg);
                console.error(`[Import Clients] Error at row ${index + 1}:`, error);
            }
        }

        const resultMsg = `Berhasil mengimpor ${successCount} data${errorCount > 0 ? `, ${errorCount} gagal` : ''}`;
        console.log(`[Import Clients] Completed: ${resultMsg}`);

        return NextResponse.json(
            {
                message: resultMsg,
                successCount,
                errorCount,
                errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('[Import Clients] Fatal error:', error);
        return NextResponse.json(
            { message: 'Terjadi kesalahan saat mengimpor data' },
            { status: 500 }
        );
    }
}
