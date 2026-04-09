const prisma = require('../config/database');

const TOOL_ALIAS_MAP = {
	wheelchair: 'Wheelchair',
	'wheel chair': 'Wheelchair',
	crutch: 'Crutches',
	crutches: 'Crutches',
	walker: 'Walker',
	'walking frame': 'Walker',
	cane: 'Walking Cane',
	'walking cane': 'Walking Cane',
	'hearing aid': 'Hearing Aid',
	'hearing aids': 'Hearing Aid',
	'prosthetic leg': 'Prosthetic Leg',
	'artificial leg': 'Prosthetic Leg',
	'prosthetic arm': 'Prosthetic Arm',
	'artificial arm': 'Prosthetic Arm',
	'toilet chair': 'Toilet Chair',
	'cp chair': 'CP Chair',
	stroller: 'Stroller',
	afo: 'AFO',
	'gait trainer': 'Gait Trainer',
	'standing frame': 'Standing Frame',
	'corner seat': 'Corner Seat',
	'electric scooter': 'Electric Scooter',
	shoes: 'Shoes',
	clothes: 'Clothes'
};

const normalizeText = (value = '') => String(value)
	.toLowerCase()
	.replace(/[^a-z0-9\s]/g, ' ')
	.replace(/\s+/g, ' ')
	.trim();

const normalizeTagLabel = (tag = '') => String(tag).replace(/[.,]+$/g, '').trim();

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
			treatmentStatusBreakdown,
			areaDistribution
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
			}),
			prisma.record.groupBy({
				by: ['district'],
				where: activeWhere,
				_count: { district: true },
				orderBy: { _count: { district: 'desc' } }
			})
		]);

		const rawToolDistribution = req.user?.organizationId
			? await prisma.$queryRaw`
				SELECT TRIM(tag) AS tag, COUNT(*)::int AS count
				FROM "Record", UNNEST("tags") AS tag
				WHERE "organizationId" = ${req.user.organizationId} AND "status" = 'active'
				GROUP BY TRIM(tag)
				ORDER BY count DESC
			`
			: await prisma.$queryRaw`
				SELECT TRIM(tag) AS tag, COUNT(*)::int AS count
				FROM "Record", UNNEST("tags") AS tag
				WHERE "status" = 'active'
				GROUP BY TRIM(tag)
				ORDER BY count DESC
			`;

		const toolCounts = rawToolDistribution.reduce((acc, row) => {
			const cleanedLabel = normalizeTagLabel(row.tag || '');
			const normalizedTag = normalizeText(cleanedLabel);
			const canonicalTool = TOOL_ALIAS_MAP[normalizedTag] || cleanedLabel;

			if (!canonicalTool) return acc;

			acc[canonicalTool] = (acc[canonicalTool] || 0) + Number(row.count || 0);
			return acc;
		}, {});

		const toolDistribution = Object.entries(toolCounts)
			.map(([name, count]) => ({ name, value: count }))
			.sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));

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
			toolDistribution,
			areaDistribution: areaDistribution.map((row) => ({
				district: row.district || 'Unknown',
				count: row._count.district
			})),
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
