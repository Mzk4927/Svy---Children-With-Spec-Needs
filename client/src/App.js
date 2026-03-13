import React, { useState, useEffect, useCallback } from 'react';
import LoginScreen from './components/auth/LoginScreen';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import RecordsPortal from './components/records/RecordsPortal';
import NewEvaluation from './components/records/NewEvaluation';
import api from './services/api';
import { useRecords } from './context/RecordsContext';
import './App.css';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [error, setError] = useState(null);
  const {
    records,
    loading,
    refreshRecords,
    clearRecords,
    createRecord,
    updateRecord,
    deleteRecord
  } = useRecords();

  const fetchRecords = useCallback(async () => {
    try {
      await refreshRecords();
    } catch (err) {
      setError(err.message);
    }
  }, [refreshRecords]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
      fetchRecords();
    }
  }, [fetchRecords]);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setActiveTab('dashboard');
    fetchRecords();
  };

  const handleLogout = async () => {
    await api.logout();
    setIsAuthenticated(false);
    setUser(null);
    clearRecords();
  };

  const handleCreateRecord = async (recordData) => {
    try {
      await createRecord(recordData);
      setActiveTab('records');
    } catch (err) {
      setError('Failed to create record: ' + err.message);
    }
  };

  const handleUpdateRecord = async (id, recordData) => {
    try {
      await updateRecord(id, recordData);
    } catch (err) {
      setError('Failed to update record: ' + err.message);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await deleteRecord(id);
    } catch (err) {
      setError('Failed to delete record: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {!isAuthenticated ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <div className="flex h-screen overflow-hidden">
          <Sidebar user={user} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
          <main className="flex-1 overflow-y-auto p-8 relative">
            {loading && <div className="absolute top-4 right-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error} <button onClick={() => setError(null)} className="float-right">✕</button>
              </div>
            )}
            {activeTab === 'dashboard' && <Dashboard records={records} user={user} onRefresh={fetchRecords} />}
            {activeTab === 'new-evaluation' && user?.role === 'admin' && (
              <NewEvaluation onSubmit={handleCreateRecord} onCancel={() => setActiveTab('records')} user={user} />
            )}
            {activeTab === 'records' && (
              <RecordsPortal
                records={records}
                user={user}
                onUpdate={handleUpdateRecord}
                onDelete={handleDeleteRecord}
                onRefresh={fetchRecords}
              />
            )}
          </main>
        </div>
      )}
    </div>
  );
}
