import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock firebase BEFORE importing the adapter
const mockGetDocs = vi.fn();
const mockAddDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockDeleteDoc = vi.fn();
const mockOnSnapshot = vi.fn();
const mockCollection = vi.fn();
const mockDoc = vi.fn();
const mockQuery = vi.fn();
const mockOrderBy = vi.fn();
const mockServerTimestamp = vi.fn().mockReturnValue('SERVER_TS');

vi.mock('firebase/firestore', () => ({
  collection: (...args) => mockCollection(...args),
  doc: (...args) => mockDoc(...args),
  addDoc: (...args) => mockAddDoc(...args),
  updateDoc: (...args) => mockUpdateDoc(...args),
  deleteDoc: (...args) => mockDeleteDoc(...args),
  getDocs: (...args) => mockGetDocs(...args),
  onSnapshot: (...args) => mockOnSnapshot(...args),
  query: (...args) => mockQuery(...args),
  orderBy: (...args) => mockOrderBy(...args),
  serverTimestamp: () => mockServerTimestamp(),
}));

vi.mock('../../../config/firebase', () => ({
  db: 'mock-db',
}));

import {
  getQuartos,
  onQuartos,
  addQuarto,
  updateQuarto,
  deleteQuarto,
} from '../quartos.firestore';

describe('quartos.firestore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery.mockReturnValue('mock-query');
    mockCollection.mockReturnValue('mock-collection');
    mockDoc.mockReturnValue('mock-doc');
    mockOrderBy.mockReturnValue('mock-order');
  });

  describe('getQuartos', () => {
    it('should return mapped quartos from Firestore', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [
          { id: 'q1', data: () => ({ numero: 101, tipo: 'standard', preco: 150 }) },
          { id: 'q2', data: () => ({ numero: 102, tipo: 'deluxe', preco: 250 }) },
        ],
      });

      const result = await getQuartos('empresa-1');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: 'q1', numero: 101, tipo: 'standard', preco: 150 });
      expect(result[1]).toEqual({ id: 'q2', numero: 102, tipo: 'deluxe', preco: 250 });
      expect(mockCollection).toHaveBeenCalledWith('mock-db', 'empresas', 'empresa-1', 'quartos');
    });

    it('should return empty array when no quartos exist', async () => {
      mockGetDocs.mockResolvedValue({ docs: [] });
      const result = await getQuartos('empresa-1');
      expect(result).toEqual([]);
    });

    it('should call query with orderBy numero', async () => {
      mockGetDocs.mockResolvedValue({ docs: [] });
      await getQuartos('empresa-1');
      expect(mockOrderBy).toHaveBeenCalledWith('numero');
      expect(mockQuery).toHaveBeenCalledWith('mock-collection', 'mock-order');
    });

    it('should throw when empresaId is empty', async () => {
      await expect(getQuartos('')).rejects.toThrow('empresaId is required');
    });

    it('should throw when empresaId is null', async () => {
      await expect(getQuartos(null)).rejects.toThrow('empresaId is required');
    });

    it('should throw when empresaId is undefined', async () => {
      await expect(getQuartos(undefined)).rejects.toThrow('empresaId is required');
    });

    it('should throw when empresaId contains path separator', async () => {
      await expect(getQuartos('a/b')).rejects.toThrow('must not contain path separators');
    });
  });

  describe('onQuartos', () => {
    it('should setup onSnapshot listener and return unsubscribe', () => {
      const callback = vi.fn();
      const unsubscribe = vi.fn();
      mockOnSnapshot.mockReturnValue(unsubscribe);

      const result = onQuartos('empresa-1', callback);

      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(result).toBe(unsubscribe);
    });

    it('should map snapshot docs when listener fires', () => {
      let snapshotCallback;
      mockOnSnapshot.mockImplementation((_query, cb) => {
        snapshotCallback = cb;
        return vi.fn();
      });
      const callback = vi.fn();

      onQuartos('empresa-1', callback);

      snapshotCallback({
        docs: [{ id: 'q1', data: () => ({ numero: 101, tipo: 'standard' }) }],
      });

      expect(callback).toHaveBeenCalledWith([
        { id: 'q1', numero: 101, tipo: 'standard' },
      ]);
    });

    it('should throw when empresaId is empty', () => {
      expect(() => onQuartos('', vi.fn())).toThrow('empresaId is required');
    });

    it('should throw when empresaId contains path separator', () => {
      expect(() => onQuartos('a/b', vi.fn())).toThrow('must not contain path separators');
    });
  });

  describe('addQuarto', () => {
    it('should add document with timestamps and return id', async () => {
      mockAddDoc.mockResolvedValue({ id: 'new-q1' });

      const result = await addQuarto('empresa-1', { numero: 201, tipo: 'suite', preco: 500 });

      expect(result).toBe('new-q1');
      expect(mockAddDoc).toHaveBeenCalledWith('mock-collection', {
        numero: 201,
        tipo: 'suite',
        preco: 500,
        criadoEm: 'SERVER_TS',
        atualizadoEm: 'SERVER_TS',
      });
    });

    it('should call collection with correct path', async () => {
      mockAddDoc.mockResolvedValue({ id: 'x' });
      await addQuarto('emp-2', { numero: 1 });
      expect(mockCollection).toHaveBeenCalledWith('mock-db', 'empresas', 'emp-2', 'quartos');
    });

    it('should throw when empresaId is empty', async () => {
      await expect(addQuarto('', {})).rejects.toThrow('empresaId is required');
    });
  });

  describe('updateQuarto', () => {
    it('should update document with atualizadoEm timestamp', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await updateQuarto('empresa-1', 'q1', { preco: 300 });

      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-doc', {
        preco: 300,
        atualizadoEm: 'SERVER_TS',
      });
    });

    it('should call doc with correct path', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);
      await updateQuarto('emp-1', 'q1', {});
      expect(mockDoc).toHaveBeenCalledWith('mock-db', 'empresas', 'emp-1', 'quartos', 'q1');
    });

    it('should throw when empresaId is empty', async () => {
      await expect(updateQuarto('', 'q1', {})).rejects.toThrow('empresaId is required');
    });
  });

  describe('deleteQuarto', () => {
    it('should delete document', async () => {
      mockDeleteDoc.mockResolvedValue(undefined);

      await deleteQuarto('empresa-1', 'q1');

      expect(mockDeleteDoc).toHaveBeenCalledWith('mock-doc');
    });

    it('should call doc with correct path', async () => {
      mockDeleteDoc.mockResolvedValue(undefined);
      await deleteQuarto('emp-1', 'q1');
      expect(mockDoc).toHaveBeenCalledWith('mock-db', 'empresas', 'emp-1', 'quartos', 'q1');
    });

    it('should throw when empresaId is empty', async () => {
      await expect(deleteQuarto('', 'q1')).rejects.toThrow('empresaId is required');
    });
  });
});
