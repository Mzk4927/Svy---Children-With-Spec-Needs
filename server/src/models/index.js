const prisma = require('../config/database');

module.exports = {
  prisma,
  User: prisma.user,
  Record: prisma.record,
  AuditLog: prisma.auditLog
};
