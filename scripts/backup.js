// scripts/backup.js  — export all records from the cloud DB to a local JSON file
// Usage: node scripts/backup.js  (run from special-needs-app root)

require('dotenv').config({ path: require('path').join(__dirname, '../server/.env') });

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backup() {
  console.log('💾 Starting database backup...');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, 'backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  const [users, records, auditLogs] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true,
        organizationId: true, isActive: true, createdAt: true,
      },
    }),
    prisma.record.findMany(),
    prisma.auditLog.findMany(),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    counts: { users: users.length, records: records.length, auditLogs: auditLogs.length },
    users,
    records,
    auditLogs,
  };

  const filePath = path.join(backupDir, `backup-${timestamp}.json`);
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');

  console.log(`✅ Backup saved to: ${filePath}`);
  console.log(`   Users: ${users.length} | Records: ${records.length} | AuditLogs: ${auditLogs.length}`);
}

backup()
  .catch((e) => {
    console.error('❌ Backup failed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
