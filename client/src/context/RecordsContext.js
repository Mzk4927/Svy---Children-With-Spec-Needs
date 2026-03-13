import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

const RecordsContext = createContext(null);

function normalizeRecords(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.records)) {
    return payload.records;
  }

  return [];
}

export function RecordsProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshRecords = useCallback(async () => {
    if (!isAuthenticated) {
      setRecords([]);
      return [];
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.getRecords();
      const nextRecords = normalizeRecords(response);
      setRecords(nextRecords);
      return nextRecords;
    } catch (recordsError) {
      setError(recordsError.message || 'Failed to load records');
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshRecords();
  }, [refreshRecords]);

  const createRecord = async (recordData) => {
    const created = await api.createRecord(recordData);
    setRecords((current) => [created, ...current]);
    return created;
  };

  const updateRecord = async (id, recordData) => {
    const updated = await api.updateRecord(id, recordData);
    setRecords((current) => current.map((record) => (record.id === id ? updated : record)));
    return updated;
  };

  const deleteRecord = async (id) => {
    await api.deleteRecord(id);
    setRecords((current) => current.filter((record) => record.id !== id));
  };

  const value = useMemo(() => ({
    records,
    loading,
    error,
    refreshRecords,
    createRecord,
    updateRecord,
    deleteRecord
  }), [records, loading, error, refreshRecords]);

  return <RecordsContext.Provider value={value}>{children}</RecordsContext.Provider>;
}

export function useRecords() {
  const context = useContext(RecordsContext);

  if (!context) {
    throw new Error('useRecords must be used within a RecordsProvider');
  }

  return context;
}
