import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const RecordsContext = createContext(null);
const RECORDS_CACHE_KEY = 'records_cache_v1';

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
  const [records, setRecords] = useState(() => {
    try {
      const cached = localStorage.getItem(RECORDS_CACHE_KEY);
      if (!cached) return [];
      return normalizeRecords(JSON.parse(cached));
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const persistRecords = useCallback((nextRecords) => {
    setRecords(nextRecords);
    localStorage.setItem(RECORDS_CACHE_KEY, JSON.stringify(nextRecords));
  }, []);

  const clearRecords = useCallback(() => {
    setRecords([]);
    localStorage.removeItem(RECORDS_CACHE_KEY);
  }, []);

  const refreshRecords = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      clearRecords();
      return [];
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.getRecords();
      const nextRecords = normalizeRecords(response);
      persistRecords(nextRecords);
      return nextRecords;
    } catch (recordsError) {
      setError(recordsError.message || 'Failed to load records');
      return [];
    } finally {
      setLoading(false);
    }
  }, [clearRecords, persistRecords]);

  useEffect(() => {
    // Stale-while-revalidate: serve cached records immediately, refetch in background.
    refreshRecords();
  }, [refreshRecords]);

  const createRecord = async (recordData) => {
    const created = await api.createRecord(recordData);
    setRecords((current) => {
      const next = [created, ...current];
      localStorage.setItem(RECORDS_CACHE_KEY, JSON.stringify(next));
      return next;
    });
    return created;
  };

  const updateRecord = async (id, recordData) => {
    const updated = await api.updateRecord(id, recordData);
    setRecords((current) => {
      const next = current.map((record) => (record.id === id ? updated : record));
      localStorage.setItem(RECORDS_CACHE_KEY, JSON.stringify(next));
      return next;
    });
    return updated;
  };

  const deleteRecord = async (id) => {
    await api.deleteRecord(id);
    setRecords((current) => {
      const next = current.filter((record) => record.id !== id);
      localStorage.setItem(RECORDS_CACHE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const value = useMemo(() => ({
    records,
    loading,
    error,
    refreshRecords,
    clearRecords,
    createRecord,
    updateRecord,
    deleteRecord
  }), [records, loading, error, refreshRecords, clearRecords]);

  return <RecordsContext.Provider value={value}>{children}</RecordsContext.Provider>;
}

export function useRecords() {
  const context = useContext(RecordsContext);

  if (!context) {
    throw new Error('useRecords must be used within a RecordsProvider');
  }

  return context;
}
