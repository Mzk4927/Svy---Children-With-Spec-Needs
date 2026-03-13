import { UNKNOWN_DISTRICT } from './constants';

export function getDistrictDistribution(records = []) {
	const districtMap = records.reduce((acc, record) => {
		const districtName = (record?.district || '').trim() || UNKNOWN_DISTRICT;
		acc[districtName] = (acc[districtName] || 0) + 1;
		return acc;
	}, {});

	return Object.entries(districtMap)
		.map(([district, count]) => ({ district, count }))
		.sort((a, b) => b.count - a.count || a.district.localeCompare(b.district));
}
