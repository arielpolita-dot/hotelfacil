import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGetDoc, mockUpdateDoc, mockDoc, mockServerTimestamp } = vi.hoisted(() => ({
  mockGetDoc: vi.fn(),
  mockUpdateDoc: vi.fn(),
  mockDoc: vi.fn().mockReturnValue('mock-doc'),
  mockServerTimestamp: vi.fn().mockReturnValue('SERVER_TS'),
}));

vi.mock('firebase/firestore', () => ({
  doc: (...a) => mockDoc(...a),
  getDoc: (...a) => mockGetDoc(...a),
  updateDoc: (...a) => mockUpdateDoc(...a),
  serverTimestamp: () => mockServerTimestamp(),
}));

vi.mock('../../../config/firebase', () => ({ db: 'mock-db' }));

import { getEmpresa, updateEmpresa } from '../empresa.firestore';

describe('empresa.firestore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getEmpresa', () => {
    it('should return empresa data when doc exists', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        id: 'emp1',
        data: () => ({ nome: 'Hotel Test', cnpj: '123' }),
      });

      const result = await getEmpresa('emp1');

      expect(result).toEqual({ id: 'emp1', nome: 'Hotel Test', cnpj: '123' });
      expect(mockDoc).toHaveBeenCalledWith('mock-db', 'empresas', 'emp1');
    });

    it('should return null when doc does not exist', async () => {
      mockGetDoc.mockResolvedValue({ exists: () => false });

      const result = await getEmpresa('emp-none');

      expect(result).toBeNull();
    });

    it('should throw when empresaId is empty', async () => {
      await expect(getEmpresa('')).rejects.toThrow('empresaId is required');
    });

    it('should throw when empresaId has path separator', async () => {
      await expect(getEmpresa('a/b')).rejects.toThrow('must not contain path separators');
    });
  });

  describe('updateEmpresa', () => {
    it('should update doc with atualizadoEm timestamp', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await updateEmpresa('emp1', { nome: 'Updated Hotel' });

      expect(mockDoc).toHaveBeenCalledWith('mock-db', 'empresas', 'emp1');
      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-doc', {
        nome: 'Updated Hotel',
        atualizadoEm: 'SERVER_TS',
      });
    });

    it('should throw when empresaId is empty', async () => {
      await expect(updateEmpresa('')).rejects.toThrow('empresaId is required');
    });

    it('should throw when empresaId has path separator', async () => {
      await expect(updateEmpresa('x/y', {})).rejects.toThrow('must not contain path separators');
    });
  });
});
