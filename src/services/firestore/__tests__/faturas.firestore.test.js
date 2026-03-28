import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockGetDocs, mockGetDoc, mockAddDoc, mockUpdateDoc, mockDeleteDoc,
  mockOnSnapshot, mockCollection, mockDoc, mockQuery, mockOrderBy,
  mockLimit, mockServerTimestamp, mockTimestamp,
} = vi.hoisted(() => ({
  mockGetDocs: vi.fn(),
  mockGetDoc: vi.fn(),
  mockAddDoc: vi.fn(),
  mockUpdateDoc: vi.fn(),
  mockDeleteDoc: vi.fn(),
  mockOnSnapshot: vi.fn(),
  mockCollection: vi.fn().mockReturnValue('mock-col'),
  mockDoc: vi.fn().mockReturnValue('mock-doc'),
  mockQuery: vi.fn().mockReturnValue('mock-query'),
  mockOrderBy: vi.fn().mockReturnValue('mock-order'),
  mockLimit: vi.fn().mockReturnValue('mock-limit'),
  mockServerTimestamp: vi.fn().mockReturnValue('SERVER_TS'),
  mockTimestamp: { fromDate: vi.fn().mockReturnValue('MOCK_TS') },
}));

vi.mock('firebase/firestore', () => ({
  collection: (...a) => mockCollection(...a),
  doc: (...a) => mockDoc(...a),
  addDoc: (...a) => mockAddDoc(...a),
  updateDoc: (...a) => mockUpdateDoc(...a),
  deleteDoc: (...a) => mockDeleteDoc(...a),
  getDocs: (...a) => mockGetDocs(...a),
  getDoc: (...a) => mockGetDoc(...a),
  onSnapshot: (...a) => mockOnSnapshot(...a),
  query: (...a) => mockQuery(...a),
  orderBy: (...a) => mockOrderBy(...a),
  limit: (...a) => mockLimit(...a),
  serverTimestamp: () => mockServerTimestamp(),
  Timestamp: mockTimestamp,
}));

vi.mock('../../../config/firebase', () => ({ db: 'mock-db' }));

import { onFaturas, addFatura, updateFatura, deleteFatura } from '../faturas.firestore';

describe('faturas.firestore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('onFaturas', () => {
    it('should subscribe with limit 200 and orderBy criadoEm desc', () => {
      const callback = vi.fn();
      mockOnSnapshot.mockReturnValue('unsub-fn');

      const unsub = onFaturas('emp1', callback);

      expect(mockCollection).toHaveBeenCalledWith('mock-db', 'empresas', 'emp1', 'faturas');
      expect(mockOrderBy).toHaveBeenCalledWith('criadoEm', 'desc');
      expect(mockLimit).toHaveBeenCalledWith(200);
      expect(unsub).toBe('unsub-fn');
    });

    it('should map snapshot docs with date conversions', () => {
      let snapshotCb;
      mockOnSnapshot.mockImplementation((_q, cb) => { snapshotCb = cb; return vi.fn(); });

      const callback = vi.fn();
      onFaturas('emp1', callback);

      const mockDate = new Date('2025-01-15');
      snapshotCb({
        docs: [{
          id: 'f1',
          data: () => ({
            valor: 100,
            dataInicio: { toDate: () => mockDate },
            dataFim: { toDate: () => mockDate },
            proximoVencimento: null,
          }),
        }],
      });

      expect(callback).toHaveBeenCalledWith([{
        id: 'f1',
        valor: 100,
        dataInicio: mockDate,
        dataFim: mockDate,
        proximoVencimento: null,
      }]);
    });

    it('should throw when empresaId is empty', () => {
      expect(() => onFaturas('', vi.fn())).toThrow('empresaId is required');
    });

    it('should throw when empresaId contains path separator', () => {
      expect(() => onFaturas('a/b', vi.fn())).toThrow('must not contain path separators');
    });
  });

  describe('addFatura', () => {
    it('should add doc with timestamps and return id', async () => {
      mockAddDoc.mockResolvedValue({ id: 'new-f1' });

      const result = await addFatura('emp1', {
        dataInicio: '2025-01-01',
        dataFim: '2025-01-31',
        proximoVencimento: '2025-02-05',
        valor: 500,
      });

      expect(result).toBe('new-f1');
      expect(mockAddDoc).toHaveBeenCalledWith('mock-col', expect.objectContaining({
        status: 'ativo',
        criadoEm: 'SERVER_TS',
        dataInicio: 'MOCK_TS',
        dataFim: 'MOCK_TS',
        proximoVencimento: 'MOCK_TS',
      }));
    });

    it('should set proximoVencimento to null when not provided', async () => {
      mockAddDoc.mockResolvedValue({ id: 'new-f2' });

      await addFatura('emp1', { dataInicio: '2025-01-01', dataFim: '2025-01-31' });

      expect(mockAddDoc).toHaveBeenCalledWith('mock-col', expect.objectContaining({
        proximoVencimento: null,
      }));
    });
  });

  describe('updateFatura', () => {
    it('should update doc with timestamp conversions', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await updateFatura('emp1', 'f1', { dataInicio: '2025-02-01', valor: 600 });

      expect(mockDoc).toHaveBeenCalledWith('mock-db', 'empresas', 'emp1', 'faturas', 'f1');
      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-doc', expect.objectContaining({
        atualizadoEm: 'SERVER_TS',
        dataInicio: 'MOCK_TS',
      }));
    });
  });

  describe('deleteFatura', () => {
    it('should delete the doc', async () => {
      mockDeleteDoc.mockResolvedValue(undefined);

      await deleteFatura('emp1', 'f1');

      expect(mockDoc).toHaveBeenCalledWith('mock-db', 'empresas', 'emp1', 'faturas', 'f1');
      expect(mockDeleteDoc).toHaveBeenCalledWith('mock-doc');
    });
  });
});
