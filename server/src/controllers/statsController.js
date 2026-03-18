const prisma = require('../config/database');

const getStatistics = async (req, res, next) => {
	try {
		const where = req.user?.organizationId
			? { organizationId: req.user.organizationId }
			: {};
		const activeWhere = { ...where, status: 'active' };

		const [
			totalRecords,
			activeRecords,
			archivedRecords,
			groupedDisabilities,
			ageGroups,
			treatmentStatusBreakdown
		] = await Promise.all([
			prisma.record.count({ where }),
			prisma.record.count({ where: activeWhere }),
			prisma.record.count({ where: { ...where, status: 'archived' } }),
			prisma.record.groupBy({
				by: ['disability'],
				where,
				_count: { disability: true },
				orderBy: { _count: { disability: 'desc' } },
				take: 10
			}),
			Promise.all([
				prisma.record.count({ where: { ...activeWhere, age: { lte: 5 } } }),
				prisma.record.count({ where: { ...activeWhere, age: { gt: 5, lte: 10 } } }),
				prisma.record.count({ where: { ...activeWhere, age: { gt: 10, lte: 15 } } }),
				prisma.record.count({ where: { ...activeWhere, age: { gt: 15 } } })
			]),
			prisma.record.groupBy({
				by: ['treatmentStatus'],
				where: activeWhere,
				_count: { treatmentStatus: true }
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

		const treatmentMap = treatmentStatusBreakdown.reduce((acc, row) => {
			const key = (row.treatmentStatus || 'Pending').toLowerCase();
			acc[key] = row._count.treatmentStatus;
			return acc;
		}, {});

		const totalCompleted = treatmentMap.completed || treatmentMap['treatment done'] || 0;
		const totalPending = activeRecords - totalCompleted;

		res.json({
			totalRecords,
			activeRecords,
			archivedRecords,
			dashboard: {
				totalActive: activeRecords,
				ageGroups: {
					'0-5': ageGroups[0],
					'6-10': ageGroups[1],
					'11-15': ageGroups[2],
					'15+': ageGroups[3]
				},
				totalPending,
				totalCompleted
			},
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
