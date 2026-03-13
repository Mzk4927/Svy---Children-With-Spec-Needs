const { PrismaClient } = require('@prisma/client');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const maxConnectionRetries = Number(process.env.PRISMA_CONNECT_RETRIES || 5);
const retryDelayMs = Number(process.env.PRISMA_CONNECT_RETRY_DELAY_MS || 2000);

const prisma = new PrismaClient({
	log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

prisma.initDatabase = async () => {
	for (let attempt = 1; attempt <= maxConnectionRetries; attempt += 1) {
		try {
			await prisma.$connect();
			await prisma.$queryRaw`SELECT 1`;
			console.log('Connected to cloud PostgreSQL database');
			return;
		} catch (error) {
			if (attempt === maxConnectionRetries) {
				throw error;
			}

			console.warn(`Prisma connection attempt ${attempt} failed, retrying in ${retryDelayMs}ms`);
			await sleep(retryDelayMs);
		}
	}
};

prisma.closeDatabase = async () => {
	await prisma.$disconnect();
};

module.exports = prisma;
