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

async function migrateData() {
  let oldConnection, newConnection;
  
  try {
    console.log('\n📊 MIGRATION DATABASE\n');
    console.log('From: expubca');
    console.log('To: expuall\n');
    console.log('=' . repeat(60));
    
    // Connect to both databases
    oldConnection = await mysql.createConnection(oldDbConfig);
    newConnection = await mysql.createConnection(newDbConfig);
    
    console.log('✅ Connected to both databases\n');
    
    // 1. Migrate customer data (customers that exist in old database)
    console.log('📋 Migrating customers...');
    const [customers] = await oldConnection.query(`
      SELECT * FROM \`clientdomain\`
    `);
    
    const uniqueEmails = [...new Set(customers.map(c => c.clientEmail))];
    console.log('Found ' + uniqueEmails.length + ' unique customers');
    
    // 2. Migrate ClientDomain records
    console.log('\n📍 Migrating domains...');
    
    for (const domain of customers) {
      // First ensure customer exists
      await newConnection.query(`
        INSERT IGNORE INTO \`customer\` (\`id\`, \`email\`, \`phone\`, \`name\`, \`status\`, \`createdAt\`, \`updatedAt\`)
        VALUES (UUID(), ?, '', ?, 'ACTIVE', NOW(), NOW())
      `, [domain.clientEmail, domain.clientEmail || 'Customer']);
      
      // Get customer id
      const [customerResult] = await newConnection.query(`
        SELECT \`id\` FROM \`customer\` WHERE \`email\` = ? LIMIT 1
      `, [domain.clientEmail]);
      
      if (customerResult.length === 0) continue;
      
      // Insert domain
      await newConnection.query(`
        INSERT IGNORE INTO \`clientdomain\` (
          \`id\`, \`clientEmail\`, \`domainName\`, \`registrar\`, 
          \`registeredAt\`, \`expiredAt\`, \`status\`, \`autoRenew\`, 
          \`notes\`, \`createdAt\`, \`updatedAt\`
        ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        domain.clientEmail,
        domain.domainName,
        domain.registrar || null,
        domain.registeredAt,
        domain.expiredAt,
        domain.status || 'ACTIVE',
        domain.autoRenew ? 1 : 0,
        domain.notes || null
      ]);
    }
    
    console.log('✅ Migrated ' + customers.length + ' domain records\n');
    
    // 3. Check for any other tables to migrate
    const [tables] = await oldConnection.query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'expubca'
    `);
    
    console.log('Tables found in expubca:');
    tables.forEach(t => console.log('  - ' + t.TABLE_NAME));
    
    console.log('\n' + '=' . repeat(60));
    console.log('✨ Migration completed!\n');
    console.log('📊 Summary:');
    console.log('  • Customers migrated: ' + uniqueEmails.length);
    console.log('  • Domains migrated: ' + customers.length);
    console.log('\n');
    
  } catch (error) {
    console.error('❌ Migration Error:', error.message);
    console.error(error);
  } finally {
    if (oldConnection) await oldConnection.end();
    if (newConnection) await newConnection.end();
  }
}

migrateData();
