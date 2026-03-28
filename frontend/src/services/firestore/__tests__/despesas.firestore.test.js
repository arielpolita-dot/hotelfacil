import { describe, it, expect, vi, beforeEach } from 'vitest';

// Batch mock
const mockBatchSet = vi.fn();
const mockBatchUpdate = vi.fn();
const mockBatchCommit = vi.fn().mockResolvedValue(undefined);
const mockWriteBatch = vi.fn().mockReturnValue({
  set: mockBatchSet,
  update: mockBatchUpdate,
  commit: mockBatchCommit,
});

// Firebase function mocks
const mockGetDocs = vi.fn();
const mockUpdateDoc = vi.fn();
const mockDeleteDoc = vi.fn();
const mockOnSnapshot = vi.fn();
const mockCollection = vi.fn();
const mockDoc = vi.fn();
const mockQuery = vi.fn();
const mockOrderBy = vi.fn();
const mockLimit = vi.fn();
const mockServerTimestamp = vi.fn().mockReturnValue('SERVER_TS');
const mockTimestampFromDate = vi.fn().mockImplementation((d) => ({
  _type: 'Timestamp',
  toDate: () => d,
}));

vi.mock('firebase/firestore', () => ({
  collection: (...args) => mockCollection(...args),
  doc: (...args) => mockDoc(...args),
  updateDoc: (...args) => mockUpdateDoc(...args),
  deleteDoc: (...args) => mockDeleteDoc(...args),
  getDocs: (...args) => mockGetDocs(...args),
  onSnapshot: (...args) => mockOnSnapshot(...args),
  query: (...args) => mockQuery(...args),
  orderBy: (...args) => mockOrderBy(...args),
  limit: (...args) => mockLimit(...args),
  serverTimestamp: () => mockServerTimestamp(),
  writeBatch: (...args) => mockWriteBatch(...args),
  Timestamp: { fromDate: (d) => mockTimestampFromDate(d) },
}));

vi.mock('../../../config/firebase', () => ({
  db: 'mock-db',
}));

import {
  getDespesas,
  onDespesas,
  addDespesa,
  updateDespesa,
  deleteDespesa,
} from '../despesas.firestore';

describe('despesas.firestore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery.mockReturnValue('mock-query');
    mockCollection.mockReturnValue('mock-collection');
    mockDoc.mockReturnValue('mock-doc');
    mockOrderBy.mockReturnValue('mock-order');
    mockLimit.mockReturnValue('mock-limit');
    mockBatchCommit.mockResolvedValue(undefined);
    mockWriteBatch.mockReturnValue({
      set: mockBatchSet,
      update: mockBatchUpdate,
      commit: mockBatchCommit,
    });
  });

  describe('getDespesas', () => {
    it('should return mapped despesas with date conversion (toDate)', async () => {
      const dataDate = new Date('2026-03-15');

      mockGetDocs.mockResolvedValue({
        docs: [
          {
            id: 'd1',
            data: () => ({
              descricao: 'Material de limpeza',
              categoria: 'Limpeza',
              valor: 150,
              data: { toDate: () => dataDate },
            }),
          },
        ],
      });

      const result = await getDespesas('empresa-1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('d1');
      expect(result[0].descricao).toBe('Material de limpeza');
      expect(result[0].valor).toBe(150);
      expect(result[0].data).toEqual(dataDate);
    });

    it('should handle string dates (no toDate method)', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [
          {
            id: 'd2',
            data: () => ({
              descricao: 'Energia',
              valor: 300,
              data: '2026-03-10',
            }),
          },
        ],
      });

      const result = await getDespesas('empresa-1');
      expect(result[0].data).toBeInstanceOf(Date);
    });

    it('should return empty array when no despesas', async () => {
      mockGetDocs.mockResolvedValue({ docs: [] });
      const result = await getDespesas('empresa-1');
      expect(result).toEqual([]);
    });

    it('should query with orderBy data desc', async () => {
      mockGetDocs.mockResolvedValue({ docs: [] });
      await getDespesas('empresa-1');
      expect(mockOrderBy).toHaveBeenCalledWith('data', 'desc');
    });

    it('should call collection with correct path', async () => {
      mockGetDocs.mockResolvedValue({ docs: [] });
      await getDespesas('empresa-1');
      expect(mockCollection).toHaveBeenCalledWith('mock-db', 'empresas', 'empresa-1', 'despesas');
    });

    it('should throw when empresaId is empty', async () => {
      await expect(getDespesas('')).rejects.toThrow('empresaId is required');
    });

    it('should throw when empresaId is null', async () => {
      await expect(getDespesas(null)).rejects.toThrow('empresaId is required');
    });

    it('should throw when empresaId contains path separator', async () => {
      await expect(getDespesas('a/b')).rejects.toThrow('must not contain path separators');
    });
  });

  describe('onDespesas', () => {
    it('should setup onSnapshot listener with limit(500) and return unsubscribe', () => {
      const callback = vi.fn();
      const unsubscribe = vi.fn();
      mockOnSnapshot.mockReturnValue(unsubscribe);

      const result = onDespesas('empresa-1', callback);

      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(mockLimit).toHaveBeenCalledWith(500);
      expect(result).toBe(unsubscribe);
    });

    it('should map snapshot docs with date conversion when listener fires', () => {
      let snapshotCallback;
      mockOnSnapshot.mockImplementation((_q, cb) => {
        snapshotCallback = cb;
        return vi.fn();
      });
      const callback = vi.fn();
      const dataDate = new Date('2026-03-20');

      onDespesas('empresa-1', callback);

      snapshotCallback({
        docs: [
          {
            id: 'd1',
            data: () => ({
              descricao: 'Agua',
              valor: 80,
              data: { toDate: () => dataDate },
            }),
          },
        ],
      });

      expect(callback).toHaveBeenCalledTimes(1);
      const mapped = callback.mock.calls[0][0];
      expect(mapped[0].id).toBe('d1');
      expect(mapped[0].data).toEqual(dataDate);
    });

    it('should throw when empresaId is empty', () => {
      expect(() => onDespesas('', vi.fn())).toThrow('empresaId is required');
    });
  });

  describe('addDespesa', () => {
    it('should batch create despesa + fluxoCaixa (tipo saida)', async () => {
      let docCallCount = 0;
      mockDoc.mockImplementation(() => {
        docCallCount++;
        if (docCallCount === 1) return { id: 'd1' }; // despesaRef
        return { id: 'fc1' }; // fluxoCaixa ref
      });

      const result = await addDespesa('emp-1', {
        descricao: 'Energia eletrica',
        categoria: 'Utilidades',
        valor: 450,
        data: '2026-03-15',
      });

      expect(result).toBe('d1');
      expect(mockBatchSet).toHaveBeenCalledTimes(2); // despesa + fluxoCaixa
      expect(mockBatchCommit).toHaveBeenCalledTimes(1);
    });

    it('should create fluxoCaixa with tipo saida', async () => {
      mockDoc.mockReturnValue({ id: 'd1' });

      await addDespesa('emp-1', {
        descricao: 'Internet',
        categoria: 'Tecnologia',
        valor: 200,
        data: '2026-03-10',
      });

      const fcData = mockBatchSet.mock.calls[1][1];
      expect(fcData.tipo).toBe('saida');
      expect(fcData.categoria).toBe('Tecnologia');
      expect(fcData.descricao).toBe('Internet');
      expect(fcData.valor).toBe(200);
      expect(fcData.despesaId).toBe('d1');
    });

    it('should convert data field to Timestamp', async () => {
      mockDoc.mockReturnValue({ id: 'd1' });

      await addDespesa('emp-1', {
        descricao: 'Test',
        valor: 100,
        data: '2026-03-15',
      });

      expect(mockTimestampFromDate).toHaveBeenCalled();
    });

    it('should throw when empresaId is empty', async () => {
      await expect(addDespesa('', {})).rejects.toThrow('empresaId is required');
    });
  });

  describe('updateDespesa', () => {
    it('should update document with atualizadoEm timestamp', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await updateDespesa('emp-1', 'd1', { descricao: 'Updated', valor: 200 });

      const callArgs = mockUpdateDoc.mock.calls[0][1];
      expect(callArgs.descricao).toBe('Updated');
      expect(callArgs.valor).toBe(200);
      expect(callArgs.atualizadoEm).toBe('SERVER_TS');
    });

    it('should convert data to Timestamp when provided', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await updateDespesa('emp-1', 'd1', { data: '2026-04-01' });

      expect(mockTimestampFromDate).toHaveBeenCalled();
    });

    it('should call doc with correct path', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);
      await updateDespesa('emp-1', 'd1', {});
      expect(mockDoc).toHaveBeenCalledWith('mock-db', 'empresas', 'emp-1', 'despesas', 'd1');
    });

    it('should throw when empresaId is empty', async () => {
      await expect(updateDespesa('', 'd1', {})).rejects.toThrow('empresaId is required');
    });
  });

  describe('deleteDespesa', () => {
    it('should delete document', async () => {
      mockDeleteDoc.mockResolvedValue(undefined);

      await deleteDespesa('emp-1', 'd1');

      expect(mockDeleteDoc).toHaveBeenCalledWith('mock-doc');
    });

    it('should call doc with correct path', async () => {
      mockDeleteDoc.mockResolvedValue(undefined);
      await deleteDespesa('emp-1', 'd1');
      expect(mockDoc).toHaveBeenCalledWith('mock-db', 'empresas', 'emp-1', 'despesas', 'd1');
    });

    it('should throw when empresaId is empty', async () => {
      await expect(deleteDespesa('', 'd1')).rejects.toThrow('empresaId is required');
    });

    it('should throw when empresaId contains path separator', async () => {
      await expect(deleteDespesa('a/b', 'd1')).rejects.toThrow('must not contain path separators');
    });
  });
});
