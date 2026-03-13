import React from 'react';

export default function StatCard({ title, value, icon, color }) {
  return (
    <div className={`p-6 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4 ${color}`}>
      <div className="p-3 bg-white rounded-lg shadow-sm">{icon}</div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}