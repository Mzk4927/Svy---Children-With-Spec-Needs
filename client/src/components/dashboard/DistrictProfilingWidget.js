import React from 'react';
import { MapPin } from 'lucide-react';

export default function DistrictProfilingWidget({ districtData, totalRecords }) {
  const safeTotal = totalRecords || 1;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="text-teal-600" />
        <h3 className="font-bold text-lg text-slate-700">Area Wise Profiling</h3>
      </div>

      {districtData.length === 0 ? (
        <div className="text-sm text-slate-500">No district data available yet.</div>
      ) : (
        <div className="space-y-3">
          {districtData.map((item) => {
            const percentage = Math.round((item.count / safeTotal) * 100);

            return (
              <div key={item.district} className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-semibold text-slate-700">{item.district}</span>
                  <span className="text-slate-500">{item.count} children</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500 mt-1">{percentage}% of total records</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
