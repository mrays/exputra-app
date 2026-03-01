import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { data } = await request.json();

        console.log(`[Import Client Servers] Starting import with ${data?.length || 0} rows`);

        if (!Array.isArray(data) || data.length === 0) {
            console.warn('[Import Client Servers] Invalid or empty data');
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
                if (!row.serverName || !row.ipAddress || !row.clientEmail) {
                    errorCount++;
                    const errorMsg = `Baris ${index + 1}: Harus memiliki serverName, ipAddress, dan clientEmail`;
                    errors.push(errorMsg);
                    console.warn(`[Import Client Servers] ${errorMsg}`);
                    continue;
                }

                // Check if customer exists
                const customer = await prisma.customer.findUnique({
                    where: { email: row.clientEmail },
                });

                if (!customer) {
                    errorCount++;
                    const errorMsg = `Baris ${index + 1}: Customer dengan email ${row.clientEmail} tidak ditemukan`;
                    errors.push(errorMsg);
                    console.warn(`[Import Client Servers] ${errorMsg}`);
                    continue;
                }

                // Check if server already exists
                const existingServer = await prisma.clientServer.findFirst({
                    where: {
                        serverName: row.serverName,
                        clientEmail: row.clientEmail,
                    },
                });

                // Helper function to parse date
                const parseDate = (dateValue: any) => {
                    if (!dateValue) return null;
                    const date = new Date(dateValue);
                    return isNaN(date.getTime()) ? null : date;
                };

                if (existingServer) {
                    // Update existing server
                    await prisma.clientServer.update({
                        where: { id: existingServer.id },
                        data: {
                            ipAddress: row.ipAddress || existingServer.ipAddress,
                            location: row.location || existingServer.location,
                            serverType: row.serverType || existingServer.serverType,
                            status: row.status || existingServer.status,
                            expiredAt: parseDate(row.expiredAt) || existingServer.expiredAt,
                            username: row.username || existingServer.username,
                            loginUrl: row.loginUrl || existingServer.loginUrl,
                            notes: row.notes || existingServer.notes,
                        },
                    });
                    console.log(`[Import Client Servers] Updated server: ${row.serverName}`);
                } else {
                    // Create new server
                    await prisma.clientServer.create({
                        data: {
                            clientEmail: row.clientEmail,
                            serverName: row.serverName,
                            ipAddress: row.ipAddress,
                            location: row.location || 'Unknown',
                            serverType: row.serverType || 'SHARED',
                            status: row.status || 'ACTIVE',
                            expiredAt: parseDate(row.expiredAt),
                            username: row.username || undefined,
                            password: row.password || undefined,
                            loginUrl: row.loginUrl || undefined,
                            notes: row.notes || undefined,
                        },
                    });
                    console.log(`[Import Client Servers] Created server: ${row.serverName}`);
                }

                successCount++;
            } catch (error) {
                errorCount++;
                const errorMsg = `Baris ${index + 1}: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`;
                errors.push(errorMsg);
                console.error(`[Import Client Servers] Error at row ${index + 1}:`, error);
            }
        }

        const resultMsg = `Berhasil mengimpor ${successCount} data${errorCount > 0 ? `, ${errorCount} gagal` : ''}`;
        console.log(`[Import Client Servers] Completed: ${resultMsg}`);

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
        console.error('[Import Client Servers] Fatal error:', error);
        return NextResponse.json(
            { message: 'Terjadi kesalahan saat mengimpor data' },
            { status: 500 }
        );
    }
}
