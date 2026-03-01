const mysql = require('mysql2/promise');

const oldDbConfig = {
  host: 'localhost',
  user: 'expubca',
  password: 'expubca',
  database: 'expubca',
  port: 3306
};

const newDbConfig = {
  host: 'localhost',
  user: 'expuall',
  password: 'expuall',
  database: 'expuall',
  port: 3306
};

async function migrateFullDatabase() {
  let oldConnection, newConnection;
  let migrationStats = {
    users: 0,
    domains: 0,
    packages: 0,
    templates: 0,
    services: 0,
    promos: 0,
    orders: 0,
    customers: 0,
    clientServers: 0
  };
  
  try {
    console.log('\n🚀 FULL DATABASE MIGRATION\n');
    console.log('From: expubca');
    console.log('To: expuall\n');
    console.log('=' . repeat(60) + '\n');
    
    // Connect to both databases
    oldConnection = await mysql.createConnection(oldDbConfig);
    newConnection = await mysql.createConnection(newDbConfig);
    
    console.log('✅ Connected to both databases\n');
    
    // 1. Migrate users (ADMIN users only)
    console.log('👤 Migrating admin users...');
    const [users] = await oldConnection.query(`SELECT * FROM \`user\` WHERE \`role\` = 'ADMIN'`);
    for (const user of users) {
      await newConnection.query(`
        INSERT IGNORE INTO \`user\` (\`id\`, \`email\`, \`password\`, \`name\`, \`role\`, \`createdAt\`, \`updatedAt\`)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [user.id, user.email, user.password, user.name, user.role, user.createdAt, user.updatedAt]);
      migrationStats.users++;
    }
    console.log('✅ ' + migrationStats.users + ' admin users\n');
    
    // 2. Migrate domains (extension list)
    console.log('🌐 Migrating domains (extensions)...');
    const [domains] = await oldConnection.query(`SELECT * FROM \`domain\` WHERE \`isActive\` = 1`);
    for (const domain of domains) {
      await newConnection.query(`
        INSERT IGNORE INTO \`domain\` (\`id\`, \`extension\`, \`price\`, \`isActive\`, \`label\`, \`createdAt\`, \`updatedAt\`)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [domain.id, domain.extension, domain.price, domain.isActive, domain.label, domain.createdAt, domain.updatedAt]);
      migrationStats.domains++;
    }
    console.log('✅ ' + migrationStats.domains + ' domain extensions\n');
    
    // 3. Migrate packages
    console.log('📦 Migrating packages...');
    const [packages] = await oldConnection.query(`SELECT * FROM \`package\` WHERE \`isActive\` = 1`);
    for (const pkg of packages) {
      await newConnection.query(`
        INSERT IGNORE INTO \`package\` (
          \`id\`, \`name\`, \`price\`, \`price1Year\`, \`price2Year\`, \`price3Year\`, 
          \`duration\`, \`features\`, \`isPopular\`, \`freeDomain\`, \`freeTemplate\`, 
          \`discountBadge\`, \`isActive\`, \`createdAt\`, \`updatedAt\`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        pkg.id, pkg.name, pkg.price, pkg.price1Year || null, pkg.price2Year || null, 
        pkg.price3Year || null, pkg.duration, pkg.features, pkg.isPopular, pkg.freeDomain, 
        pkg.freeTemplate, pkg.discountBadge || null, pkg.isActive, pkg.createdAt, pkg.updatedAt
      ]);
      migrationStats.packages++;
    }
    console.log('✅ ' + migrationStats.packages + ' packages\n');
    
    // 4. Migrate templates
    console.log('🎨 Migrating templates...');
    const [templates] = await oldConnection.query(`SELECT * FROM \`template\` WHERE \`isActive\` = 1`);
    for (const tpl of templates) {
      await newConnection.query(`
        INSERT IGNORE INTO \`template\` (
          \`id\`, \`name\`, \`thumbnail\`, \`previewUrl\`, \`category\`, 
          \`price\`, \`isPaid\`, \`description\`, \`isActive\`, \`createdAt\`, \`updatedAt\`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        tpl.id, tpl.name, tpl.thumbnail || null, tpl.previewUrl || null, tpl.category,
        tpl.price, tpl.isPaid, tpl.description || null, tpl.isActive, tpl.createdAt, tpl.updatedAt
      ]);
      migrationStats.templates++;
    }
    console.log('✅ ' + migrationStats.templates + ' templates\n');
    
    // 5. Migrate services
    console.log('🛠️ Migrating services...');
    const [services] = await oldConnection.query(`SELECT * FROM \`service\` WHERE \`isActive\` = 1`);
    for (const svc of services) {
      await newConnection.query(`
        INSERT IGNORE INTO \`service\` (
          \`id\`, \`name\`, \`description\`, \`price\`, \`priceType\`, \`isActive\`, \`createdAt\`, \`updatedAt\`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        svc.id, svc.name, svc.description || null, svc.price, svc.priceType, 
        svc.isActive, svc.createdAt, svc.updatedAt
      ]);
      migrationStats.services++;
    }
    console.log('✅ ' + migrationStats.services + ' services\n');
    
    // 6. Migrate promos
    console.log('🎁 Migrating promos...');
    const [promos] = await oldConnection.query(`SELECT * FROM \`promo\` WHERE \`isActive\` = 1`);
    for (const promo of promos) {
      await newConnection.query(`
        INSERT IGNORE INTO \`promo\` (
          \`id\`, \`code\`, \`discountType\`, \`discountValue\`, \`minTransaction\`, 
          \`maxDiscount\`, \`expiredAt\`, \`isActive\`, \`createdAt\`, \`updatedAt\`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        promo.id, promo.code, promo.discountType, promo.discountValue, promo.minTransaction,
        promo.maxDiscount || null, promo.expiredAt || null, promo.isActive, promo.createdAt, promo.updatedAt
      ]);
      migrationStats.promos++;
    }
    console.log('✅ ' + migrationStats.promos + ' promos\n');
    
    // 7. Migrate customers
    console.log('👥 Migrating customers...');
    const [customers] = await oldConnection.query(`SELECT * FROM \`customer\`
 LIMIT 1000`);
    for (const cust of customers) {
      await newConnection.query(`
        INSERT IGNORE INTO \`customer\` (
          \`id\`, \`email\`, \`phone\`, \`name\`, \`company\`, \`address\`, 
          \`whatsapp\`, \`notes\`, \`status\`, \`createdAt\`, \`updatedAt\`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        cust.id, cust.email, cust.phone || '', cust.name || cust.email, cust.company || null,
        cust.address || null, cust.whatsapp || null, cust.notes || null, cust.status || 'ACTIVE',
        cust.createdAt, cust.updatedAt
      ]);
      migrationStats.customers++;
    }
    console.log('✅ ' + migrationStats.customers + ' customers\n');
    
    // 8. Migrate client domains
    console.log('📍 Migrating client domains...');
    const [clientDomains] = await oldConnection.query(`SELECT * FROM \`clientdomain\` LIMIT 5000`);
    for (const cdomain of clientDomains) {
      // Ensure customer exists
      const [custCheck] = await newConnection.query(
        `SELECT id FROM \`customer\` WHERE \`email\` = ? LIMIT 1`,
        [cdomain.clientEmail]
      );
      
      if (custCheck.length === 0) {
        // Create customer if not exists
        await newConnection.query(`
          INSERT IGNORE INTO \`customer\` (\`id\`, \`email\`, \`phone\`, \`name\`, \`status\`, \`createdAt\`, \`updatedAt\`)
          VALUES (UUID(), ?, '', ?, 'ACTIVE', NOW(), NOW())
        `, [cdomain.clientEmail, cdomain.clientEmail]);
      }
      
      await newConnection.query(`
        INSERT IGNORE INTO \`clientdomain\` (
          \`id\`, \`clientEmail\`, \`domainName\`, \`registrar\`, \`registrarId\`,
          \`registeredAt\`, \`expiredAt\`, \`status\`, \`autoRenew\`, \`notes\`, \`createdAt\`, \`updatedAt\`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        cdomain.id, cdomain.clientEmail, cdomain.domainName, cdomain.registrar || null,
        cdomain.registrarId || null, cdomain.registeredAt, cdomain.expiredAt, cdomain.status || 'ACTIVE',
        cdomain.autoRenew ? 1 : 0, cdomain.notes || null, cdomain.createdAt, cdomain.updatedAt
      ]);
      migrationStats.domains++;
    }
    console.log('✅ ' + migrationStats.domains + ' client domains\n');
    
    // 9. Migrate client servers
    console.log('🖥️  Migrating client servers...');
    const [clientServers] = await oldConnection.query(`SELECT * FROM \`clientserver\` LIMIT 1000`);
    for (const server of clientServers) {
      await newConnection.query(`
        INSERT IGNORE INTO \`clientserver\` (
          \`id\`, \`clientEmail\`, \`serverName\`, \`ipAddress\`, \`location\`, 
          \`serverType\`, \`status\`, \`expiredAt\`, \`username\`, \`password\`, 
          \`loginUrl\`, \`notes\`, \`createdAt\`, \`updatedAt\`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        server.id, server.clientEmail, server.serverName, server.ipAddress, server.location,
        server.serverType, server.status || 'ACTIVE', server.expiredAt || null, 
        server.username || null, server.password || null, server.loginUrl || null,
        server.notes || null, server.createdAt, server.updatedAt
      ]);
      migrationStats.clientServers++;
    }
    console.log('✅ ' + migrationStats.clientServers + ' client servers\n');
    
    // 10. Migrate orders
    console.log('📊 Migrating orders...');
    const [orders] = await oldConnection.query(`SELECT * FROM \`order\` LIMIT 5000`);
    for (const order of orders) {
      await newConnection.query(`
        INSERT IGNORE INTO \`order\` (
          \`id\`, \`invoiceId\`, \`userId\`, \`domainName\`, \`domainId\`, \`templateId\`,
          \`packageId\`, \`promoId\`, \`customerName\`, \`customerEmail\`, \`customerPhone\`,
          \`subtotal\`, \`discount\`, \`total\`, \`status\`, \`paymentMethod\`, \`paymentRef\`,
          \`paidAt\`, \`expiredAt\`, \`websiteUsername\`, \`websitePassword\`, \`loginUrl\`,
          \`websiteEmail\`, \`notes\`, \`createdAt\`, \`updatedAt\`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        order.id, order.invoiceId, order.userId || null, order.domainName, order.domainId,
        order.templateId || null, order.packageId || null, order.promoId || null,
        order.customerName, order.customerEmail, order.customerPhone, order.subtotal,
        order.discount || 0, order.total, order.status || 'PENDING', order.paymentMethod || null,
        order.paymentRef || null, order.paidAt || null, order.expiredAt || null,
        order.websiteUsername || null, order.websitePassword || null, order.loginUrl || null,
        order.websiteEmail || null, order.notes || null, order.createdAt, order.updatedAt
      ]);
      migrationStats.orders++;
    }
    console.log('✅ ' + migrationStats.orders + ' orders\n');
    
    console.log('=' . repeat(60));
    console.log('\n✨ MIGRATION COMPLETED!\n');
    console.log('📊 SUMMARY:');
    console.log('  • Admin users: ' + migrationStats.users);
    console.log('  • Domain extensions: ' + migrationStats.domains);
    console.log('  • Packages: ' + migrationStats.packages);
    console.log('  • Templates: ' + migrationStats.templates);
    console.log('  • Services: ' + migrationStats.services);
    console.log('  • Promos: ' + migrationStats.promos);
    console.log('  • Customers: ' + migrationStats.customers);
    console.log('  • Client servers: ' + migrationStats.clientServers);
    console.log('  • Orders: ' + migrationStats.orders);
    console.log('\n');
    
  } catch (error) {
    console.error('\n❌ Migration Error:', error.message);
    console.error(error);
  } finally {
    if (oldConnection) await oldConnection.end();
    if (newConnection) await newConnection.end();
  }
}

migrateFullDatabase();
