const prisma = require('../config/database');

const getStatistics = async (req, res, next) => {
	try {
		const where = req.user?.organizationId
			? { organizationId: req.user.organizationId }
			: {};

		const [totalRecords, activeRecords, archivedRecords, groupedDisabilities] = await Promise.all([
			prisma.record.count({ where }),
			prisma.record.count({ where: { ...where, status: 'active' } }),
			prisma.record.count({ where: { ...where, status: 'archived' } }),
			prisma.record.groupBy({
				by: ['disability'],
				where,
				_count: { disability: true },
				orderBy: { _count: { disability: 'desc' } },
				take: 10
			})
		]);

		const monthlyTrend = req.user?.organizationId
			? await prisma.$queryRaw`
				SELECT EXTRACT(YEAR FROM "createdAt")::int AS year,
				       EXTRACT(MONTH FROM "createdAt")::int AS month,
				       COUNT(*)::int AS count
				FROM "Record"
				WHERE "organizationId" = ${req.user.organizationId}
				GROUP BY year, month
				ORDER BY year ASC, month ASC
				LIMIT 12
			`
			: await prisma.$queryRaw`
				SELECT EXTRACT(YEAR FROM "createdAt")::int AS year,
				       EXTRACT(MONTH FROM "createdAt")::int AS month,
				       COUNT(*)::int AS count
				FROM "Record"
				GROUP BY year, month
				ORDER BY year ASC, month ASC
				LIMIT 12
			`;

		res.json({
			totalRecords,
			activeRecords,
			archivedRecords,
			disabilityBreakdown: groupedDisabilities.map((row) => ({
				_id: row.disability,
				count: row._count.disability
			})),
			monthlyTrend
		});
	} catch (err) {
		next(err);
	}
};

module.exports = { getStatistics };
