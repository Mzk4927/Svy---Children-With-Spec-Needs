import React, { useMemo } from 'react';
import { Users, BarChart2, PieChart, Wrench, Clock, CheckCircle } from 'lucide-react';
import StatCard from './StatCard';
import DistrictProfilingWidget from './DistrictProfilingWidget';
import { getDistrictDistribution } from '../../utils/helpers';

const REQUEST_CATEGORIES = ['Imed Asst Req', 'Medicine Referral', 'Physio Referral'];
const TOOL_CATEGORIES = [
  'Wheelchair',
  'Crutches',
  'Walker (Walking Frame)',
  'Walking Cane',
  'Prosthetic Leg (Artificial Leg)',
  'Prosthetic Arm (Artificial Arm)',
  'Hearing Aid'
];

export default function Dashboard({ records, onRefresh }) {
  const localStats = useMemo(() => {
    return {
      total: records.length,
      ageGroups: {
        '0-5': records.filter(r => r.age <= 5).length,
        '6-10': records.filter(r => r.age > 5 && r.age <= 10).length,
        '11-15': records.filter(r => r.age > 10 && r.age <= 15).length,
        '15+': records.filter(r => r.age > 15).length
      }
    };
  }, [records]);

  const requestDistribution = useMemo(() => {
    return REQUEST_CATEGORIES.map((categoryName) => {
      const children = records
        .filter((record) => (record.tags || []).includes(categoryName))
        .map((record) => record.name);

      return {
        name: categoryName,
        children,
        value: children.length
      };
    });
  }, [records]);

  const toolDistribution = useMemo(() => {
    return TOOL_CATEGORIES.map((toolName) => {
      const assignedChildren = records.filter((record) => (record.tags || []).includes(toolName));
      return {
        name: toolName,
        value: assignedChildren.length,
        children: assignedChildren.map((record) => record.name)
      };
    }).filter((tool) => tool.value > 0);
  }, [records]);

  const districtDistribution = useMemo(() => getDistrictDistribution(records), [records]);

  const treatmentStats = useMemo(() => ({
    pending: records.filter(r => (r.treatmentStatus || 'Pending').toLowerCase() !== 'completed').length,
    completed: records.filter(r => (r.treatmentStatus || '').toLowerCase() === 'completed').length
  }), [records]);

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Dashboard Overview</h2>
          <span className="text-sm text-slate-500">Last updated: {new Date().toLocaleString()}</span>
        </div>
        <button onClick={onRefresh} className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300">Refresh Data</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        <StatCard title="Total Children" value={localStats.total || 0} icon={<Users className="text-blue-600" />} color="bg-blue-50" />
        <StatCard title="Ages 0-5" value={localStats.ageGroups?.['0-5'] || 0} icon={<Users className="text-emerald-600" />} color="bg-emerald-50" />
        <StatCard title="Ages 6-15" value={(localStats.ageGroups?.['6-10'] || 0) + (localStats.ageGroups?.['11-15'] || 0)} icon={<Users className="text-amber-600" />} color="bg-amber-50" />
        <StatCard title="Ages 15+" value={localStats.ageGroups?.['15+'] || 0} icon={<Users className="text-purple-600" />} color="bg-purple-50" />
        <StatCard title="Treatment Pending" value={treatmentStats.pending} icon={<Clock className="text-amber-600" />} color="bg-amber-50" />
        <StatCard title="Treatment Done" value={treatmentStats.completed} icon={<CheckCircle className="text-emerald-600" />} color="bg-emerald-50" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <Wrench className="text-indigo-600" />
            <h3 className="font-bold text-lg text-slate-700">Equipment / Tool Distribution</h3>
          </div>
          <div className="space-y-4">
            {toolDistribution.length === 0 ? (
              <div className="text-sm text-slate-500">No tools assigned yet.</div>
            ) : (
              toolDistribution.map((item) => (
                <div key={item.name} className="relative bg-slate-50 border border-slate-100 rounded-lg p-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">{item.name}</span>
                    <span className="text-slate-500">{item.value} children</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${(item.value / (localStats.total || 1)) * 100}%` }}></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <DistrictProfilingWidget districtData={districtDistribution} totalRecords={localStats.total} />

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 className="text-blue-600" />
            <h3 className="font-bold text-lg text-slate-700">Imed Asst Req / Referral Distribution</h3>
          </div>
          <div className="space-y-4">
            {requestDistribution.map((item) => (
              <div key={item.name} className="relative bg-slate-50 border border-slate-100 rounded-lg p-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{item.name}</span>
                  <span className="text-slate-500">{item.value} children</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${(item.value / (localStats.total || 1)) * 100}%` }}></div>
                </div>
                {item.children.length > 0 ? (
                  <div className="mt-2 text-xs text-slate-600">
                    {item.children.join(', ')}
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-slate-400">No child assigned yet.</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
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