// scripts/seedData.js  — seed demo users into the Prisma/PostgreSQL database
// Usage: node scripts/seedData.js  (run from special-needs-app root)

// Resolve paths relative to the server folder where all modules are installed
const path = require('path');
const serverDir = path.join(__dirname, '../server');

require('dotenv').config({ path: path.join(serverDir, '.env') });

// Load modules from server/node_modules
const { PrismaClient } = require(path.join(serverDir, 'node_modules/@prisma/client'));
const bcrypt = require(path.join(serverDir, 'node_modules/bcryptjs'));

const prisma = new PrismaClient();

const FIXED_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function main() {
  console.log('🌱 Starting database seed...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const viewerPassword = await bcrypt.hash('viewer123', 10);

  // Upsert admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
      organizationId: FIXED_ORG_ID,
      isActive: true,
      permissions: ['read', 'write', 'delete', 'admin'],
    },
  });
  console.log('✅ Admin user ready:', admin.email);

  // Upsert viewer user
  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@example.com' },
    update: {},
    create: {
      name: 'Viewer User',
      email: 'viewer@example.com',
      password: viewerPassword,
      role: 'viewer',
      organizationId: FIXED_ORG_ID,
      isActive: true,
      permissions: ['read'],
    },
  });
  console.log('✅ Viewer user ready:', viewer.email);

  console.log('\n🎉 Seed complete!');
  console.log('   Admin  → admin@example.com  / admin123');
  console.log('   Viewer → viewer@example.com / viewer123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
