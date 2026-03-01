import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { data } = await request.json();

        console.log(`[Import Domain Registrars] Starting import with ${data?.length || 0} rows`);

        if (!Array.isArray(data) || data.length === 0) {
            console.warn('[Import Domain Registrars] Invalid or empty data');
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
                if (!row.name) {
                    errorCount++;
                    const errorMsg = `Baris ${index + 1}: Harus memiliki name`;
                    errors.push(errorMsg);
                    console.warn(`[Import Domain Registrars] ${errorMsg}`);
                    continue;
                }

                // Check if registrar already exists
                const existingRegistrar = await prisma.domainRegistrar.findFirst({
                    where: {
                        name: row.name,
                    },
                });

                if (existingRegistrar) {
                    // Update existing registrar
                    await prisma.domainRegistrar.update({
                        where: { id: existingRegistrar.id },
                        data: {
                            username: row.username || existingRegistrar.username,
                            loginUrl: row.loginUrl || existingRegistrar.loginUrl,
                            expiredAt: row.expiredAt ? new Date(row.expiredAt) : existingRegistrar.expiredAt,
                            notes: row.notes || existingRegistrar.notes,
                            isActive: row.isActive !== undefined ? row.isActive : existingRegistrar.isActive,
                        },
                    });
                    console.log(`[Import Domain Registrars] Updated registrar: ${row.name}`);
                } else {
                    // Create new registrar
                    await prisma.domainRegistrar.create({
                        data: {
                            name: row.name,
                            username: row.username || undefined,
                            password: row.password || undefined,
                            loginUrl: row.loginUrl || undefined,
                            expiredAt: row.expiredAt ? new Date(row.expiredAt) : undefined,
                            notes: row.notes || undefined,
                            isActive: row.isActive !== undefined ? row.isActive : true,
                        },
                    });
                    console.log(`[Import Domain Registrars] Created registrar: ${row.name}`);
                }

                successCount++;
            } catch (error) {
                errorCount++;
                const errorMsg = `Baris ${index + 1}: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`;
                errors.push(errorMsg);
                console.error(`[Import Domain Registrars] Error at row ${index + 1}:`, error);
            }
        }

        const resultMsg = `Berhasil mengimpor ${successCount} data${errorCount > 0 ? `, ${errorCount} gagal` : ''}`;
        console.log(`[Import Domain Registrars] Completed: ${resultMsg}`);

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
        console.error('[Import Domain Registrars] Fatal error:', error);
        return NextResponse.json(
            { message: 'Terjadi kesalahan saat mengimpor data' },
            { status: 500 }
        );
    }
}
