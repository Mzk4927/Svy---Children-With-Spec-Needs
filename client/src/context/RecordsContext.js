import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const RecordsContext = createContext(null);
const RECORDS_CACHE_KEY = 'records_cache_v1';
const DEFAULT_PAGE_SIZE = 100;
const DEFAULT_AGE_GROUP = 'all';

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
  const [totalCount, setTotalCount] = useState(() => {
    try {
      const cached = localStorage.getItem(RECORDS_CACHE_KEY);
      if (!cached) return 0;
      const parsed = normalizeRecords(JSON.parse(cached));
      return parsed.length;
    } catch {
      return 0;
    }
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(DEFAULT_AGE_GROUP);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const persistRecords = useCallback((nextRecords) => {
    setRecords(nextRecords);
    localStorage.setItem(RECORDS_CACHE_KEY, JSON.stringify(nextRecords));
  }, []);

  const clearRecords = useCallback(() => {
    setRecords([]);
    setTotalCount(0);
    setCurrentPage(1);
    setTotalPages(1);
    setSearchQuery('');
    setSelectedAgeGroup(DEFAULT_AGE_GROUP);
    localStorage.removeItem(RECORDS_CACHE_KEY);
  }, []);

  const refreshRecords = useCallback(async (options = {}) => {
    const token = localStorage.getItem('token');
    if (!token) {
      clearRecords();
      return [];
    }

    const requestedPage = Number(options.page || currentPage);
    const requestedLimit = Number(options.limit || pageSize);
    const requestedSearch = String(options.search ?? searchQuery).trim();
    const requestedAgeGroup = String(options.ageGroup ?? (selectedAgeGroup || DEFAULT_AGE_GROUP));

    setLoading(true);
    setError('');

    try {
      const response = await api.getRecords({
        page: requestedPage,
        limit: requestedLimit,
        search: requestedSearch,
        ageGroup: requestedAgeGroup
      });
      const nextRecords = normalizeRecords(response);
      persistRecords(nextRecords);
      const nextTotalCount = Number(response?.totalCount ?? response?.total ?? nextRecords.length);
      const nextTotalPages = Number(response?.totalPages ?? Math.max(1, Math.ceil(nextTotalCount / requestedLimit)));

      setTotalCount(nextTotalCount);
      setCurrentPage(requestedPage);
      setPageSize(requestedLimit);
      setTotalPages(nextTotalPages);
      setSearchQuery(requestedSearch);
      setSelectedAgeGroup(requestedAgeGroup);

      return nextRecords;
    } catch (recordsError) {
      setError(recordsError.message || 'Failed to load records');
      return [];
    } finally {
      setLoading(false);
    }
  }, [clearRecords, currentPage, pageSize, persistRecords, searchQuery, selectedAgeGroup]);

  const goToPage = useCallback(async (nextPage) => {
    const safePage = Math.max(1, Math.min(nextPage, totalPages || 1));
    return refreshRecords({
      page: safePage,
      limit: pageSize,
      search: searchQuery,
      ageGroup: selectedAgeGroup
    });
  }, [pageSize, refreshRecords, searchQuery, selectedAgeGroup, totalPages]);

  const applyFilters = useCallback(async ({ search, ageGroup } = {}) => {
    const nextSearch = String(search ?? searchQuery).trim();
    const nextAgeGroup = String(ageGroup ?? (selectedAgeGroup || DEFAULT_AGE_GROUP));
    return refreshRecords({
      page: 1,
      limit: pageSize,
      search: nextSearch,
      ageGroup: nextAgeGroup
    });
  }, [pageSize, refreshRecords, searchQuery, selectedAgeGroup]);

  useEffect(() => {
    // Stale-while-revalidate: serve cached records immediately, refetch in background.
    refreshRecords({ page: 1, limit: DEFAULT_PAGE_SIZE });
    // Intentionally run on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createRecord = async (recordData) => {
    const created = await api.createRecord(recordData);
    setRecords((current) => {
      const next = [created, ...current];
      localStorage.setItem(RECORDS_CACHE_KEY, JSON.stringify(next));
      return next;
    });
    setTotalCount((count) => count + 1);
    return created;
  };

  const updateRecord = async (id, recordData) => {
    const previousRecord = records.find((record) => record.id === id);

    setRecords((current) => {
      const next = current.map((record) => (record.id === id ? { ...record, ...recordData } : record));
      localStorage.setItem(RECORDS_CACHE_KEY, JSON.stringify(next));
      return next;
    });

    try {
      const updated = await api.updateRecord(id, recordData);
      setRecords((current) => {
        const next = current.map((record) => (record.id === id ? updated : record));
        localStorage.setItem(RECORDS_CACHE_KEY, JSON.stringify(next));
        return next;
      });
      return updated;
    } catch (error) {
      if (previousRecord) {
        setRecords((current) => {
          const next = current.map((record) => (record.id === id ? previousRecord : record));
          localStorage.setItem(RECORDS_CACHE_KEY, JSON.stringify(next));
          return next;
        });
      }
      throw error;
    }
  };

  const deleteRecord = async (id) => {
    await api.deleteRecord(id);
    setRecords((current) => {
      const next = current.filter((record) => record.id !== id);
      localStorage.setItem(RECORDS_CACHE_KEY, JSON.stringify(next));
      return next;
    });
    setTotalCount((count) => Math.max(0, count - 1));
  };

  const value = useMemo(() => ({
    records,
    totalCount,
    currentPage,
    pageSize,
    totalPages,
    searchQuery,
    selectedAgeGroup,
    loading,
    error,
    refreshRecords,
    goToPage,
    applyFilters,
    clearRecords,
    createRecord,
    updateRecord,
    deleteRecord
  }), [records, totalCount, currentPage, pageSize, totalPages, searchQuery, selectedAgeGroup, loading, error, refreshRecords, goToPage, applyFilters, clearRecords, createRecord, updateRecord, deleteRecord]);

  return <RecordsContext.Provider value={value}>{children}</RecordsContext.Provider>;
}

export function useRecords() {
  const context = useContext(RecordsContext);

  if (!context) {
    throw new Error('useRecords must be used within a RecordsProvider');
  }

  return context;
}
