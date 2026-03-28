import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockGetDocs, mockAddDoc, mockOnSnapshot, mockCollection,
  mockQuery, mockOrderBy, mockLimit, mockServerTimestamp, mockTimestamp,
} = vi.hoisted(() => ({
  mockGetDocs: vi.fn(),
  mockAddDoc: vi.fn(),
  mockOnSnapshot: vi.fn(),
  mockCollection: vi.fn().mockReturnValue('mock-col'),
  mockQuery: vi.fn().mockReturnValue('mock-query'),
  mockOrderBy: vi.fn().mockReturnValue('mock-order'),
  mockLimit: vi.fn().mockReturnValue('mock-limit'),
  mockServerTimestamp: vi.fn().mockReturnValue('SERVER_TS'),
  mockTimestamp: { fromDate: vi.fn().mockReturnValue('MOCK_TS') },
}));

vi.mock('firebase/firestore', () => ({
  collection: (...a) => mockCollection(...a),
  addDoc: (...a) => mockAddDoc(...a),
  getDocs: (...a) => mockGetDocs(...a),
  onSnapshot: (...a) => mockOnSnapshot(...a),
  query: (...a) => mockQuery(...a),
  orderBy: (...a) => mockOrderBy(...a),
  limit: (...a) => mockLimit(...a),
  serverTimestamp: () => mockServerTimestamp(),
  Timestamp: mockTimestamp,
}));

vi.mock('../../../config/firebase', () => ({ db: 'mock-db' }));

import { onFluxoCaixa, addFluxoCaixa, getFluxoCaixa } from '../fluxoCaixa.firestore';

describe('fluxoCaixa.firestore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('onFluxoCaixa', () => {
    it('should subscribe with limit 1000 and orderBy data desc', () => {
      mockOnSnapshot.mockReturnValue('unsub');

      const unsub = onFluxoCaixa('emp1', vi.fn());

      expect(mockCollection).toHaveBeenCalledWith('mock-db', 'empresas', 'emp1', 'fluxoCaixa');
      expect(mockOrderBy).toHaveBeenCalledWith('data', 'desc');
      expect(mockLimit).toHaveBeenCalledWith(1000);
      expect(unsub).toBe('unsub');
    });

    it('should convert Firestore timestamps to Date objects', () => {
      let snapshotCb;
      mockOnSnapshot.mockImplementation((_q, cb) => { snapshotCb = cb; return vi.fn(); });

      const callback = vi.fn();
      onFluxoCaixa('emp1', callback);

      const mockDate = new Date('2025-03-01');
      snapshotCb({
        docs: [{
          id: 'fc1',
          data: () => ({ tipo: 'entrada', valor: 1000, data: { toDate: () => mockDate } }),
        }],
      });

      expect(callback).toHaveBeenCalledWith([{
        id: 'fc1',
        tipo: 'entrada',
        valor: 1000,
        data: mockDate,
      }]);
    });

    it('should throw when empresaId is empty', () => {
      expect(() => onFluxoCaixa('', vi.fn())).toThrow('empresaId is required');
    });

    it('should throw when empresaId has path separator', () => {
      expect(() => onFluxoCaixa('x/y', vi.fn())).toThrow('must not contain path separators');
    });
  });

  describe('addFluxoCaixa', () => {
    it('should add doc with Timestamp.fromDate when data provided', async () => {
      mockAddDoc.mockResolvedValue({ id: 'fc-new' });

      const result = await addFluxoCaixa('emp1', { tipo: 'saida', valor: 200, data: '2025-03-01' });

      expect(result).toBe('fc-new');
      expect(mockAddDoc).toHaveBeenCalledWith('mock-col', expect.objectContaining({
        tipo: 'saida',
        valor: 200,
        data: 'MOCK_TS',
        criadoEm: 'SERVER_TS',
      }));
    });

    it('should use serverTimestamp when data not provided', async () => {
      mockAddDoc.mockResolvedValue({ id: 'fc-new2' });

      await addFluxoCaixa('emp1', { tipo: 'entrada', valor: 300 });

      expect(mockAddDoc).toHaveBeenCalledWith('mock-col', expect.objectContaining({
        data: 'SERVER_TS',
        criadoEm: 'SERVER_TS',
      }));
    });
  });

  describe('getFluxoCaixa', () => {
    it('should return mapped docs with date conversion', async () => {
      const mockDate = new Date('2025-02-15');
      mockGetDocs.mockResolvedValue({
        docs: [{
          id: 'fc1',
          data: () => ({ tipo: 'entrada', valor: 500, data: { toDate: () => mockDate } }),
        }],
      });

      const result = await getFluxoCaixa('emp1');

      expect(result).toEqual([{ id: 'fc1', tipo: 'entrada', valor: 500, data: mockDate }]);
    });

    it('should throw when empresaId is empty', async () => {
      await expect(getFluxoCaixa('')).rejects.toThrow('empresaId is required');
    });
  });
});
