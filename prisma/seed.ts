import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Admin User
  const hashedPassword = await bcrypt.hash('password123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: { password: hashedPassword },
    create: {
      email: 'admin@admin.com',
      password: hashedPassword,
      name: 'Administrator',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create Domains
  const domains = [
    { extension: '.com', price: 150000, label: 'POPULAR' as const },
    { extension: '.id', price: 250000, label: 'BEST_SELLER' as const },
    { extension: '.co.id', price: 200000, label: null },
    { extension: '.net', price: 175000, label: null },
    { extension: '.org', price: 180000, label: null },
    { extension: '.info', price: 120000, label: 'PROMO' as const },
  ];

  for (const domain of domains) {
    await prisma.domain.upsert({
      where: { extension: domain.extension },
      update: { price: domain.price, label: domain.label },
      create: domain,
    });
  }
  console.log('✅ Domains created');

  // Create Templates
  const templates = [
    { name: 'Business Pro', category: 'Company Profile', price: 0, isPaid: false, thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400' },
    { name: 'E-Commerce starter', category: 'E-Commerce', price: 500000, isPaid: true, thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400' },
    { name: 'Portfolio Minimal', category: 'Portfolio', price: 0, isPaid: false, thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
    { name: 'Landing Page Pro', category: 'Landing Page', price: 300000, isPaid: true, thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400' },
    { name: 'Blog starter', category: 'Blog', price: 0, isPaid: false, thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400' },
    { name: 'Restaurant Theme', category: 'Custom', price: 750000, isPaid: true, thumbnail: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400' },
  ];

  for (const template of templates) {
    const existing = await prisma.template.findFirst({ where: { name: template.name } });
    if (!existing) {
      await prisma.template.create({ data: template });
    }
  }
  console.log('✅ Templates created');

  // Create Packages
  const packages = [
    { name: 'Basic', price: 1500000, duration: 1, features: 'Hosting 1GB\nSSL Gratis\nEmail 1 Akun\nSupport Email', isPopular: false },
    { name: 'Premium', price: 2500000, duration: 2, features: 'Hosting 5GB\nSSL Gratis\nEmail 5 Akun\nSupport 24/7\nBackup Mingguan\nSEO Basic', isPopular: true },
    { name: 'Enterprise', price: 4500000, duration: 3, features: 'Hosting Unlimited\nSSL Gratis\nEmail Unlimited\nSupport Priority\nBackup Harian\nSEO Advanced\nCustom Domain\nAnalytics', isPopular: false },
  ];

  for (const pkg of packages) {
    const existing = await prisma.package.findFirst({ where: { name: pkg.name, duration: pkg.duration } });
    if (!existing) {
      await prisma.package.create({ data: pkg });
    }
  }
  console.log('✅ Packages created');

  // Create Services
  const services = [
    { name: 'Jasa Edit Website', description: 'Revisi dan update konten website', price: 500000, priceType: 'ONE_TIME' as const },
    { name: 'Maintenance Bulanan', description: 'Pemeliharaan dan update rutin', price: 300000, priceType: 'PER_YEAR' as const },
    { name: 'SEO Optimization', description: 'Optimasi mesin pencari', price: 1000000, priceType: 'ONE_TIME' as const },
    { name: 'Social Media Integration', description: 'Integrasi dengan sosial media', price: 250000, priceType: 'ONE_TIME' as const },
    { name: 'Custom Landing Page', description: 'Halaman landing page tambahan', price: 750000, priceType: 'ONE_TIME' as const },
  ];

  for (const service of services) {
    const existing = await prisma.service.findFirst({ where: { name: service.name } });
    if (!existing) {
      await prisma.service.create({ data: service });
    }
  }
  console.log('✅ Services created');

  // Create Promos
  const promos = [
    { code: 'DISKON10', discountType: 'PERCENT' as const, discountValue: 10, minTransaction: 1000000, maxDiscount: 500000 },
    { code: 'HEMAT50K', discountType: 'NOMINAL' as const, discountValue: 50000, minTransaction: 500000, maxDiscount: null },
    { code: 'NEWUSER', discountType: 'PERCENT' as const, discountValue: 15, minTransaction: 2000000, maxDiscount: 750000 },
  ];

  for (const promo of promos) {
    await prisma.promo.upsert({
      where: { code: promo.code },
      update: {},
      create: promo,
    });
  }
  console.log('✅ Promos created');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
