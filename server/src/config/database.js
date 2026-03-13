const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
	log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

prisma.initDatabase = async () => {
	await prisma.$connect();
	console.log('Connected to cloud PostgreSQL database');
};

prisma.closeDatabase = async () => {
	await prisma.$disconnect();
};

module.exports = prisma;
