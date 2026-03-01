const bcrypt = require('bcryptjs');

async function generatePassword() {
  // Generate random secure password
  const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
  
  // Hash the password
  const hashedPassword = await bcrypt.hash(randomPassword, 12);
  
  console.log('\n🔑 PASSWORD GENERATOR FOR ADMIN LOGIN\n');
  console.log('=' . repeat(50));
  console.log('Plain Password:', randomPassword);
  console.log('Hashed Password:', hashedPassword);
  console.log('=' . repeat(50));
  console.log('\n📝 To update admin user, run this query in your database:\n');
  console.log(`UPDATE \`user\` SET \`password\` = '${hashedPassword}' WHERE \`email\` = 'admin@example.com' AND \`role\` = 'ADMIN';\n`);
  console.log('Or use the Prisma command:\n');
  console.log(`npx prisma studio\n`);
  console.log('Then manually update the password field in the user record.\n');
}

generatePassword().catch(console.error);
