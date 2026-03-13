import React from 'react';

export default function StatCard({ title, value, icon, color }) {
  return (
    <div className={`p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 ${color}`}>
      <div className="p-3.5 bg-white rounded-xl shadow-sm border border-slate-100">{icon}</div>
      <div>
        <p className="text-base font-semibold text-slate-600">{title}</p>
        <p className="text-4xl font-black leading-none mt-1 text-slate-800">{value}</p>
      </div>
    </div>
  );
}