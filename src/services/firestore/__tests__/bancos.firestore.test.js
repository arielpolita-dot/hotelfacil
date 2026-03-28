import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockGetDocs, mockAddDoc, mockUpdateDoc, mockDeleteDoc, mockOnSnapshot,
  mockCollection, mockDoc, mockQuery, mockOrderBy, mockServerTimestamp,
  mockBatchSet, mockBatchUpdate, mockBatchCommit, mockWriteBatch,
} = vi.hoisted(() => {
  const mockBatchSet = vi.fn();
  const mockBatchUpdate = vi.fn();
  const mockBatchCommit = vi.fn().mockResolvedValue(undefined);
  return {
    mockGetDocs: vi.fn(),
    mockAddDoc: vi.fn(),
    mockUpdateDoc: vi.fn(),
    mockDeleteDoc: vi.fn(),
    mockOnSnapshot: vi.fn(),
    mockCollection: vi.fn().mockReturnValue('mock-col'),
    mockDoc: vi.fn().mockReturnValue('mock-doc'),
    mockQuery: vi.fn().mockReturnValue('mock-query'),
    mockOrderBy: vi.fn().mockReturnValue('mock-order'),
    mockServerTimestamp: vi.fn().mockReturnValue('SERVER_TS'),
    mockBatchSet,
    mockBatchUpdate,
    mockBatchCommit,
    mockWriteBatch: vi.fn().mockReturnValue({ set: mockBatchSet, update: mockBatchUpdate, commit: mockBatchCommit }),
  };
});

vi.mock('firebase/firestore', () => ({
  collection: (...a) => mockCollection(...a),
  doc: (...a) => mockDoc(...a),
  addDoc: (...a) => mockAddDoc(...a),
  updateDoc: (...a) => mockUpdateDoc(...a),
  deleteDoc: (...a) => mockDeleteDoc(...a),
  getDocs: (...a) => mockGetDocs(...a),
  onSnapshot: (...a) => mockOnSnapshot(...a),
  query: (...a) => mockQuery(...a),
  orderBy: (...a) => mockOrderBy(...a),
  serverTimestamp: () => mockServerTimestamp(),
  writeBatch: (...a) => mockWriteBatch(...a),
}));

vi.mock('../../../config/firebase', () => ({ db: 'mock-db' }));

import { onBancos, addBanco, updateBanco, deleteBanco, seedBancosIniciais } from '../bancos.firestore';

describe('bancos.firestore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('onBancos', () => {
    it('should subscribe ordered by nome', () => {
      mockOnSnapshot.mockReturnValue('unsub');

      const unsub = onBancos('emp1', vi.fn());

      expect(mockCollection).toHaveBeenCalledWith('mock-db', 'empresas', 'emp1', 'bancos');
      expect(mockOrderBy).toHaveBeenCalledWith('nome');
      expect(unsub).toBe('unsub');
    });

    it('should map snapshot docs', () => {
      let snapshotCb;
      mockOnSnapshot.mockImplementation((_q, cb) => { snapshotCb = cb; return vi.fn(); });

      const callback = vi.fn();
      onBancos('emp1', callback);

      snapshotCb({ docs: [{ id: 'b1', data: () => ({ nome: 'Itau', codigo: '341' }) }] });

      expect(callback).toHaveBeenCalledWith([{ id: 'b1', nome: 'Itau', codigo: '341' }]);
    });

    it('should throw when empresaId is empty', () => {
      expect(() => onBancos('', vi.fn())).toThrow('empresaId is required');
    });

    it('should throw when empresaId has path separator', () => {
      expect(() => onBancos('a/b', vi.fn())).toThrow('must not contain path separators');
    });
  });

  describe('addBanco', () => {
    it('should add doc with timestamps', async () => {
      mockAddDoc.mockResolvedValue({ id: 'new-b1' });

      await addBanco('emp1', { nome: 'Nubank', codigo: '260' });

      expect(mockAddDoc).toHaveBeenCalledWith('mock-col', expect.objectContaining({
        nome: 'Nubank',
        codigo: '260',
        criadoEm: 'SERVER_TS',
        atualizadoEm: 'SERVER_TS',
      }));
    });
  });

  describe('updateBanco', () => {
    it('should update doc with atualizadoEm', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await updateBanco('emp1', 'b1', { nome: 'Updated' });

      expect(mockDoc).toHaveBeenCalledWith('mock-db', 'empresas', 'emp1', 'bancos', 'b1');
      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-doc', { nome: 'Updated', atualizadoEm: 'SERVER_TS' });
    });
  });

  describe('deleteBanco', () => {
    it('should delete the doc', async () => {
      mockDeleteDoc.mockResolvedValue(undefined);

      await deleteBanco('emp1', 'b1');

      expect(mockDoc).toHaveBeenCalledWith('mock-db', 'empresas', 'emp1', 'bancos', 'b1');
      expect(mockDeleteDoc).toHaveBeenCalledWith('mock-doc');
    });
  });

  describe('seedBancosIniciais', () => {
    it('should seed 9 bancos when collection is empty', async () => {
      mockGetDocs.mockResolvedValue({ empty: true });

      await seedBancosIniciais('emp1');

      expect(mockWriteBatch).toHaveBeenCalledWith('mock-db');
      expect(mockBatchSet).toHaveBeenCalledTimes(9);
      expect(mockBatchCommit).toHaveBeenCalledTimes(1);
    });

    it('should skip seeding when collection is not empty', async () => {
      mockGetDocs.mockResolvedValue({ empty: false });

      await seedBancosIniciais('emp1');

      expect(mockWriteBatch).not.toHaveBeenCalled();
      expect(mockBatchCommit).not.toHaveBeenCalled();
    });
  });
});
