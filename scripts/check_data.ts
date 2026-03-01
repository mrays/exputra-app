import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log("Querying _packagefreedomains...")
    // Using ticks for safety with table name that might be case sensitive or reserved
    const data = await prisma.$queryRawUnsafe("SELECT * FROM `_packagefreedomains`")
    console.log("Data in _packagefreedomains:", JSON.stringify(data, null, 2))
    
    // Also let's check if _PackageFreeDomains exists (the one current schema expects)
    try {
        const data2 = await prisma.$queryRawUnsafe("SELECT * FROM `_PackageFreeDomains`")
        console.log("Data in _PackageFreeDomains:", JSON.stringify(data2, null, 2))
    } catch {
        console.log("_PackageFreeDomains table does not exist or empty.")
    }

  } catch (e) {
    console.error("Error querying table:", e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
