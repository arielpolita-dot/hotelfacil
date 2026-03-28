import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockAddDoc, mockUpdateDoc, mockDeleteDoc, mockOnSnapshot,
  mockCollection, mockDoc, mockQuery, mockOrderBy, mockServerTimestamp,
} = vi.hoisted(() => ({
  mockAddDoc: vi.fn(),
  mockUpdateDoc: vi.fn(),
  mockDeleteDoc: vi.fn(),
  mockOnSnapshot: vi.fn(),
  mockCollection: vi.fn().mockReturnValue('mock-col'),
  mockDoc: vi.fn().mockReturnValue('mock-doc'),
  mockQuery: vi.fn().mockReturnValue('mock-query'),
  mockOrderBy: vi.fn().mockReturnValue('mock-order'),
  mockServerTimestamp: vi.fn().mockReturnValue('SERVER_TS'),
}));

vi.mock('firebase/firestore', () => ({
  collection: (...a) => mockCollection(...a),
  doc: (...a) => mockDoc(...a),
  addDoc: (...a) => mockAddDoc(...a),
  updateDoc: (...a) => mockUpdateDoc(...a),
  deleteDoc: (...a) => mockDeleteDoc(...a),
  onSnapshot: (...a) => mockOnSnapshot(...a),
  query: (...a) => mockQuery(...a),
  orderBy: (...a) => mockOrderBy(...a),
  serverTimestamp: () => mockServerTimestamp(),
}));

vi.mock('../../../config/firebase', () => ({ db: 'mock-db' }));

import { onFornecedores, addFornecedor, updateFornecedor, deleteFornecedor } from '../fornecedores.firestore';

describe('fornecedores.firestore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('onFornecedores', () => {
    it('should subscribe ordered by nome', () => {
      mockOnSnapshot.mockReturnValue('unsub');

      const unsub = onFornecedores('emp1', vi.fn());

      expect(mockCollection).toHaveBeenCalledWith('mock-db', 'empresas', 'emp1', 'fornecedores');
      expect(mockOrderBy).toHaveBeenCalledWith('nome');
      expect(unsub).toBe('unsub');
    });

    it('should map snapshot docs to array', () => {
      let snapshotCb;
      mockOnSnapshot.mockImplementation((_q, cb) => { snapshotCb = cb; return vi.fn(); });

      const callback = vi.fn();
      onFornecedores('emp1', callback);

      snapshotCb({ docs: [{ id: 'f1', data: () => ({ nome: 'Fornecedor A' }) }] });

      expect(callback).toHaveBeenCalledWith([{ id: 'f1', nome: 'Fornecedor A' }]);
    });

    it('should throw when empresaId is empty', () => {
      expect(() => onFornecedores('', vi.fn())).toThrow('empresaId is required');
    });

    it('should throw when empresaId has path separator', () => {
      expect(() => onFornecedores('x/y', vi.fn())).toThrow('must not contain path separators');
    });
  });

  describe('addFornecedor', () => {
    it('should add doc with timestamps', async () => {
      mockAddDoc.mockResolvedValue({ id: 'new-f1' });

      await addFornecedor('emp1', { nome: 'Novo Fornecedor', cnpj: '123' });

      expect(mockAddDoc).toHaveBeenCalledWith('mock-col', expect.objectContaining({
        nome: 'Novo Fornecedor',
        cnpj: '123',
        criadoEm: 'SERVER_TS',
        atualizadoEm: 'SERVER_TS',
      }));
    });
  });

  describe('updateFornecedor', () => {
    it('should update doc with atualizadoEm timestamp', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await updateFornecedor('emp1', 'f1', { nome: 'Updated' });

      expect(mockDoc).toHaveBeenCalledWith('mock-db', 'empresas', 'emp1', 'fornecedores', 'f1');
      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-doc', {
        nome: 'Updated',
        atualizadoEm: 'SERVER_TS',
      });
    });
  });

  describe('deleteFornecedor', () => {
    it('should delete the doc', async () => {
      mockDeleteDoc.mockResolvedValue(undefined);

      await deleteFornecedor('emp1', 'f1');

      expect(mockDoc).toHaveBeenCalledWith('mock-db', 'empresas', 'emp1', 'fornecedores', 'f1');
      expect(mockDeleteDoc).toHaveBeenCalledWith('mock-doc');
    });
  });
});
