import React from 'react';
import { LayoutDashboard, PlusCircle, Users, LogOut } from 'lucide-react';
import NavButton from './NavButton';

export default function Sidebar({ user, activeTab, setActiveTab, onLogout }) {
  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full shadow-xl">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-white font-bold text-lg leading-tight">
          Svy - Children With<br/>
          <span className="text-blue-400">Spec Needs</span>
        </h2>
        <div className="mt-4 p-3 bg-slate-800 rounded-lg">
          <p className="text-xs text-slate-400">Logged in as</p>
          <p className="text-sm font-medium text-white truncate">{user?.name || user?.email}</p>
          <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded mt-1 inline-block capitalize">
            {user?.role}
          </span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavButton
          active={activeTab === 'dashboard'}
          onClick={() => setActiveTab('dashboard')}
          icon={<LayoutDashboard size={20} />}
          label="Dashboard"
        />
        {user?.role === 'admin' && (
          <NavButton
            active={activeTab === 'new-evaluation'}
            onClick={() => setActiveTab('new-evaluation')}
            icon={<PlusCircle size={20} />}
            label="New Evaluation"
          />
        )}
        <NavButton
          active={activeTab === 'records'}
          onClick={() => setActiveTab('records')}
          icon={<Users size={20} />}
          label="All Records"
        />
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
