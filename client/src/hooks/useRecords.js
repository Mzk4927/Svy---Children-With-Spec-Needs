import { useState, useEffect, useCallback } from 'react';
import { recordsApi } from '../services/api';
import { socket } from '../services/socket';
import { useAuth } from './useAuth';
import { toast } from 'react-toastify';

export const useRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const { user } = useAuth();

  // Load records
  const loadRecords = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await recordsApi.getAll(params);
      setRecords(response.data.data);
      setTotalCount(response.data.total);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load records');
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create record
  const createRecord = useCallback(async (recordData) => {
    setLoading(true);
    try {
      const response = await recordsApi.create(recordData);
      setRecords(prev => [response.data, ...prev]);
      toast.success('Record created successfully');
      return response.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create record');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update record
  const updateRecord = useCallback(async (id, recordData) => {
    setLoading(true);
    try {
      const response = await recordsApi.update(id, recordData);
      setRecords(prev => prev.map(r => r.id === id ? response.data : r));
      toast.success('Record updated successfully');
      return response.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update record');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete record
  const deleteRecord = useCallback(async (id) => {
    setLoading(true);
    try {
      await recordsApi.delete(id);
      setRecords(prev => prev.filter(r => r.id !== id));
      toast.success('Record deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete record');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time updates via socket
  useEffect(() => {
    if (!socket) return;

    const handleRecordCreated = (newRecord) => {
      setRecords(prev => [newRecord, ...prev]);
      toast.info('New record added by another user');
    };

    const handleRecordUpdated = (updatedRecord) => {
      setRecords(prev => prev.map(r => 
        r.id === updatedRecord.id ? updatedRecord : r
      ));
      toast.info('Record updated by another user');
    };

    const handleRecordDeleted = (deletedId) => {
      setRecords(prev => prev.filter(r => r.id !== deletedId));
      toast.info('Record deleted by another user');
    };

    socket.on('record-created', handleRecordCreated);
    socket.on('record-updated', handleRecordUpdated);
    socket.on('record-deleted', handleRecordDeleted);

    return () => {
      socket.off('record-created', handleRecordCreated);
      socket.off('record-updated', handleRecordUpdated);
      socket.off('record-deleted', handleRecordDeleted);
    };
  }, []);

  // Initial load
  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  return {
    records,
    loading,
    error,
    totalCount,
    loadRecords,
    createRecord,
    updateRecord,
    deleteRecord
  };
};