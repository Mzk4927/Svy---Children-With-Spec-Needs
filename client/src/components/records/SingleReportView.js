import React from 'react';
import { FileBadge, Activity, Users, Printer, X } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

const getImageSrc = (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  if (imageUrl.startsWith('/')) return `${API_ORIGIN}${imageUrl}`;
  return `${API_ORIGIN}/${imageUrl}`;
};

export default function SingleReportView({ record, onClose }) {
  const imageSrc = getImageSrc(record.imageUrl);

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      <div className="fixed top-0 left-0 right-0 bg-slate-800 p-4 flex justify-between items-center print:hidden shadow-lg">
        <h3 className="text-white font-bold flex items-center gap-2"><FileBadge className="text-blue-400" /> Single Patient Report</h3>
        <div className="flex gap-4">
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"><Printer size={18} /> Print / Save PDF</button>
          <button onClick={onClose} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"><X size={18} /> Close</button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto mt-24 mb-12 p-12 bg-white border-2 border-slate-800 print:mt-0 print:border-4 print:h-screen print:w-full print:max-w-none print:shadow-none shadow-2xl">
        <div className="text-center border-b-2 border-slate-800 pb-8 mb-8">
          <div className="flex justify-center mb-4"><Activity className="w-16 h-16 text-slate-800" /></div>
          <h1 className="text-4xl font-extrabold text-slate-900 uppercase tracking-widest mb-2">Medical Evaluation Report</h1>
          <p className="text-lg text-slate-600 font-serif italic">Special Needs Assessment Camp</p>
          <p className="text-sm text-slate-500 mt-2">Date: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="flex flex-col-reverse md:flex-row gap-8 mb-8">
          <div className="flex-1 bg-slate-50 p-6 border border-slate-200 rounded-lg print:bg-white print:border-slate-300">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-300 pb-2 mb-4 uppercase">Patient Information</h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div><span className="text-xs text-slate-500 uppercase tracking-wide block">Patient Name</span><span className="text-xl font-bold text-slate-900">{record.name}</span></div>
              <div><span className="text-xs text-slate-500 uppercase tracking-wide block">Guardian / Father</span><span className="text-xl font-bold text-slate-900">{record.fatherName}</span></div>
              <div><span className="text-xs text-slate-500 uppercase tracking-wide block">Age</span><span className="text-lg text-slate-900">{record.age} Years</span></div>
              <div><span className="text-xs text-slate-500 uppercase tracking-wide block">Contact</span><span className="text-lg text-slate-900">{record.contact}</span></div>
              <div className="col-span-2"><span className="text-xs text-slate-500 uppercase tracking-wide block">Address</span><span className="text-lg text-slate-900">{record.address}</span></div>
            </div>
          </div>
          <div className="w-48 h-48 flex-shrink-0 mx-auto md:mx-0 border-4 border-slate-200 shadow-sm bg-slate-100 flex items-center justify-center overflow-hidden rounded-lg">
            {imageSrc ? (
              <img src={imageSrc} alt="Patient" className="w-full h-full object-cover" />
            ) : (
              <div className="text-slate-300 flex flex-col items-center"><Users size={48} /><span className="text-xs uppercase mt-2 font-bold">No Photo</span></div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="border border-slate-300 p-6 rounded-lg">
            <h3 className="text-slate-500 uppercase text-xs font-bold mb-2">Diagnosis / Disability</h3>
            <p className="text-2xl font-bold text-slate-900 leading-relaxed">{record.disability}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-slate-300 p-6 rounded-lg bg-blue-50 print:bg-white">
              <h3 className="text-blue-800 uppercase text-xs font-bold mb-2 print:text-black">Doctor's Advice</h3>
              <p className="text-lg font-medium text-slate-900">{record.advice}</p>
            </div>
            <div className="border border-slate-300 p-6 rounded-lg">
              <h3 className="text-slate-500 uppercase text-xs font-bold mb-2">Remarks / Notes</h3>
              <p className="text-lg text-slate-700">{record.remarks || "No additional remarks."}</p>
            </div>
          </div>
        </div>

        <div className="mt-24 pt-8 border-t-2 border-slate-200 flex justify-between items-end print:mt-48">
          <div className="text-center"><div className="w-48 border-b border-slate-400 mb-2"></div><p className="text-sm font-bold text-slate-600 uppercase">Medical Officer Signature</p></div>
          <div className="text-center"><div className="w-48 border-b border-slate-400 mb-2"></div><p className="text-sm font-bold text-slate-600 uppercase">Camp Coordinator</p></div>
        </div>
        <div className="text-center mt-12 text-xs text-slate-400 print:mt-12"><p>Generated by Evaluation of Special Needs System • {new Date().toLocaleDateString()}</p></div>
      </div>
    </div>
  );
}