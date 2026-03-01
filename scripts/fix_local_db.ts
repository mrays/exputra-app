import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log("Checking for conflicting constraints locally...")

        // Get constraints referencing customer.email
        const constraints: any[] = await prisma.$queryRawUnsafe(`
      SELECT TABLE_NAME, CONSTRAINT_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE CONSTRAINT_SCHEMA = 'websitepesanjasa'
      AND REFERENCED_TABLE_NAME = 'customer'
      AND REFERENCED_COLUMN_NAME = 'email';
    `)

        console.log("Found constraints:", constraints)

        // Generate drop statements
        const queries: string[] = [];
        if (Array.isArray(constraints)) {
            for (const c of constraints) {
                if (c.CONSTRAINT_NAME) {
                    queries.push(`ALTER TABLE \`${c.TABLE_NAME}\` DROP FOREIGN KEY \`${c.CONSTRAINT_NAME}\`;`)
                }
            }
        }

        // Aggressively drop all potential conflicting indices
        const indicesToDrop = [
            `DROP INDEX \`customer_email_key\` ON \`customer\``,
            `DROP INDEX \`domain_extension_key\` ON \`domain\``,
            `DROP INDEX \`order_invoiceId_key\` ON \`order\``,
            `DROP INDEX \`user_email_key\` ON \`user\``,
            `DROP INDEX \`promo_code_key\` ON \`promo\``,
            `DROP INDEX \`clientdomain_domainName_key\` ON \`clientdomain\``
        ];

        for (const q of indicesToDrop) {
            queries.push(q + ";");
        }

        console.log("\n--- SUGGESTED FIX COMMANDS ---")
        queries.forEach((q: string) => console.log(q))

        for (const q of queries) {
            try {
                console.log(`Executing: ${q}`)
                await prisma.$queryRawUnsafe(q)
                console.log("Success.")
            } catch (e: any) {
                console.log(`Failed (might not exist or match): ${e.message}`)
            }
        }

    } catch (e: any) {
        console.error("Error:", e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
