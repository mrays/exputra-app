import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log("Starting full database export...")
        const outputFile = 'deploy_full_backup.sql'

        // 1. Header: Disable FK checks
        let sql = `SET FOREIGN_KEY_CHECKS=0;\n\n`

        // 2. Get all tables (except migrations)
        const tables: any[] = await prisma.$queryRawUnsafe(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'websitepesanjasa' 
        AND table_name != '_prisma_migrations';
    `)

        for (const t of tables) {
            const tableName = t.table_name || t.TABLE_NAME;
            console.log(`Processing table: ${tableName}`)

            // Truncate table command (optional, but good for clean import)
            // We comment it out if user wants to keep existing data, but for full sync usually we want to replace or ignore.
            // Let's use INSERT IGNORE to be safe, or just standard INSERT.
            // sql += `TRUNCATE TABLE \`${tableName}\`;\n`; // Risky if they want to merge. Let's generally avoid TRUNCATE unless requested.

            // Fetch data
            const rows: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM \`${tableName}\``)

            if (rows.length > 0) {
                sql += `-- Data for table ${tableName}\n`

                for (const row of rows) {
                    const keys = Object.keys(row).map(k => `\`${k}\``).join(', ')
                    const values = Object.values(row).map(v => {
                        if (v === null) return 'NULL'
                        if (typeof v === 'boolean') return v ? 1 : 0
                        if (v instanceof Date) return `'${v.toISOString().slice(0, 19).replace('T', ' ')}'` // MySQL datetime format
                        if (typeof v === 'string') return `'${v.replace(/'/g, "''").replace(/\\/g, "\\\\")}'` // Escape single quotes and backslashes
                        return v
                    }).join(', ')

                    sql += `INSERT IGNORE INTO \`${tableName}\` (${keys}) VALUES (${values});\n`
                }
                sql += `\n`
            }
        }

        // 3. Footer: Enable FK checks
        sql += `SET FOREIGN_KEY_CHECKS=1;\n`

        fs.writeFileSync(outputFile, sql, 'utf-8')
        console.log(`Export completed to ${outputFile}`)

    } catch (e: any) {
        console.error("Export failed:", e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
