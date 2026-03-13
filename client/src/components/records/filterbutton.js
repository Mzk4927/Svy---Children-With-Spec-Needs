import React from 'react';

export default function FilterButton({ label, active, onClick }) {
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${active ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
      {label}
    </button>
  );
}