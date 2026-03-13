const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const FIXED_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const viewerPassword = await bcrypt.hash('viewer123', 10);

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

  console.log('Admin:', admin.email, '/ admin123');
  console.log('Viewer:', viewer.email, '/ viewer123');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
