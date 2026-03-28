import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockGetDocs, mockGetDoc, mockAddDoc, mockUpdateDoc, mockDeleteDoc,
  mockOnSnapshot, mockCollection, mockDoc, mockQuery, mockOrderBy,
  mockLimit, mockServerTimestamp, mockTimestamp, mockCreateUser,
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
  mockCreateUser: vi.fn(),
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

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: (...a) => mockCreateUser(...a),
}));

vi.mock('../../../config/firebase', () => ({ db: 'mock-db', auth: 'mock-auth' }));

import { getUsuarios, onUsuarios, addUsuario, updateUsuario, deleteUsuario } from '../usuarios.firestore';

describe('usuarios.firestore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUsuarios', () => {
    it('should return mapped docs', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [
          { id: 'u1', data: () => ({ nome: 'Alice', role: 'Admin' }) },
          { id: 'u2', data: () => ({ nome: 'Bob', role: 'Gerente' }) },
        ],
      });

      const result = await getUsuarios('emp1');

      expect(result).toEqual([
        { id: 'u1', nome: 'Alice', role: 'Admin' },
        { id: 'u2', nome: 'Bob', role: 'Gerente' },
      ]);
      expect(mockCollection).toHaveBeenCalledWith('mock-db', 'empresas', 'emp1', 'usuarios');
    });

    it('should throw when empresaId is empty', async () => {
      await expect(getUsuarios('')).rejects.toThrow('empresaId is required');
    });
  });

  describe('onUsuarios', () => {
    it('should subscribe and map docs on snapshot', () => {
      let snapshotCb;
      mockOnSnapshot.mockImplementation((_col, cb) => { snapshotCb = cb; return 'unsub'; });

      const callback = vi.fn();
      const unsub = onUsuarios('emp1', callback);

      snapshotCb({ docs: [{ id: 'u1', data: () => ({ nome: 'Alice' }) }] });

      expect(unsub).toBe('unsub');
      expect(callback).toHaveBeenCalledWith([{ id: 'u1', nome: 'Alice' }]);
    });

    it('should throw when empresaId contains path separator', () => {
      expect(() => onUsuarios('a/b', vi.fn())).toThrow('must not contain path separators');
    });
  });

  describe('addUsuario', () => {
    it('should create auth user and two firestore docs, return uid', async () => {
      mockCreateUser.mockResolvedValue({ user: { uid: 'uid-123' } });
      mockAddDoc.mockResolvedValue({ id: 'doc-id' });

      const uid = await addUsuario('emp1', {
        nome: 'Carlos',
        email: 'carlos@test.com',
        senha: '123456',
        role: 'Gerente',
      });

      expect(uid).toBe('uid-123');
      expect(mockCreateUser).toHaveBeenCalledWith('mock-auth', 'carlos@test.com', '123456');
      // Two addDoc calls: empresa subcollection + global usuarios
      expect(mockAddDoc).toHaveBeenCalledTimes(2);
      expect(mockAddDoc).toHaveBeenCalledWith('mock-col', expect.objectContaining({
        uid: 'uid-123',
        nome: 'Carlos',
        email: 'carlos@test.com',
        role: 'Gerente',
        criadoEm: 'SERVER_TS',
      }));
    });
  });

  describe('updateUsuario', () => {
    it('should strip senha and confirmarSenha from update data', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await updateUsuario('emp1', 'u1', { nome: 'Updated', senha: 'secret', confirmarSenha: 'secret' });

      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-doc', {
        nome: 'Updated',
        atualizadoEm: 'SERVER_TS',
      });
    });
  });

  describe('deleteUsuario', () => {
    it('should delete the usuario doc', async () => {
      mockDeleteDoc.mockResolvedValue(undefined);

      await deleteUsuario('emp1', 'u1');

      expect(mockDoc).toHaveBeenCalledWith('mock-db', 'empresas', 'emp1', 'usuarios', 'u1');
      expect(mockDeleteDoc).toHaveBeenCalledWith('mock-doc');
    });
  });
});
