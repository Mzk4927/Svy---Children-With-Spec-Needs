import React, { useState, useEffect, useMemo } from 'react';
import { Users, BarChart2, PieChart } from 'lucide-react';
import StatCard from './StatCard';
import api from '../../services/api';

export default function Dashboard({ records, user, onRefresh }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const data = await api.getStatistics();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const localStats = useMemo(() => {
    if (stats) return stats;
    return {
      total: records.length,
      ageGroups: {
        '0-5': records.filter(r => r.age <= 5).length,
        '6-10': records.filter(r => r.age > 5 && r.age <= 10).length,
        '11-15': records.filter(r => r.age > 10 && r.age <= 15).length,
        '15+': records.filter(r => r.age > 15).length
      }
    };
  }, [records, stats]);

  const disabilityData = useMemo(() => {
    const counts = {};
    records.forEach(r => {
      const type = r.disability ? r.disability.split(/[/(,]/)[0].trim() : "Other";
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [records]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
          <span className="text-sm text-slate-500">Last updated: {new Date().toLocaleString()}</span>
        </div>
        <button onClick={onRefresh} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Refresh Data</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Children" value={localStats.total || 0} icon={<Users className="text-blue-600" />} color="bg-blue-50" />
        <StatCard title="Ages 0-5" value={localStats.ageGroups?.['0-5'] || 0} icon={<Users className="text-emerald-600" />} color="bg-emerald-50" />
        <StatCard title="Ages 6-15" value={(localStats.ageGroups?.['6-10'] || 0) + (localStats.ageGroups?.['11-15'] || 0)} icon={<Users className="text-amber-600" />} color="bg-amber-50" />
        <StatCard title="Ages 15+" value={localStats.ageGroups?.['15+'] || 0} icon={<Users className="text-purple-600" />} color="bg-purple-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Disability Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 className="text-blue-600" />
            <h3 className="font-bold text-lg text-slate-700">Disease / Disability Distribution</h3>
          </div>
          <div className="space-y-3">
            {disabilityData.slice(0, 6).map((item, idx) => (
              <div key={idx} className="relative">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{item.name}</span>
                  <span className="text-slate-500">{item.value} children</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${(item.value / (localStats.total || 1)) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Age Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="text-purple-600" />
            <h3 className="font-bold text-lg text-slate-700">Age Distribution</h3>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="w-48 h-48 rounded-full border-4 border-white shadow-xl mb-6 relative" style={{
              background: `conic-gradient(
                #3b82f6 0% ${(localStats.ageGroups?.['0-5'] || 0) / (localStats.total || 1) * 100}%, 
                #10b981 ${(localStats.ageGroups?.['0-5'] || 0) / (localStats.total || 1) * 100}% ${((localStats.ageGroups?.['0-5'] || 0) + (localStats.ageGroups?.['6-10'] || 0)) / (localStats.total || 1) * 100}%,
                #f59e0b ${((localStats.ageGroups?.['0-5'] || 0) + (localStats.ageGroups?.['6-10'] || 0)) / (localStats.total || 1) * 100}% ${((localStats.ageGroups?.['0-5'] || 0) + (localStats.ageGroups?.['6-10'] || 0) + (localStats.ageGroups?.['11-15'] || 0)) / (localStats.total || 1) * 100}%,
                #8b5cf6 ${((localStats.ageGroups?.['0-5'] || 0) + (localStats.ageGroups?.['6-10'] || 0) + (localStats.ageGroups?.['11-15'] || 0)) / (localStats.total || 1) * 100}% 100%
              )`
            }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-inner">
                  <span className="text-xs font-bold text-slate-400">BY AGE</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div><span>0-5 Yrs ({localStats.ageGroups?.['0-5'] || 0})</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div><span>6-10 Yrs ({localStats.ageGroups?.['6-10'] || 0})</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-500 rounded-full"></div><span>11-15 Yrs ({localStats.ageGroups?.['11-15'] || 0})</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-500 rounded-full"></div><span>15+ Yrs ({localStats.ageGroups?.['15+'] || 0})</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}