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
  getReservas,
  onReservas,
  addReserva,
  updateReserva,
  checkoutReserva,
  cancelarReserva,
} from '../reservas.firestore';

describe('reservas.firestore', () => {
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

  describe('getReservas', () => {
    it('should return mapped reservas with date conversion (toDate)', async () => {
      const checkIn = new Date('2026-04-01');
      const checkOut = new Date('2026-04-03');
      const criado = new Date('2026-03-28');

      mockGetDocs.mockResolvedValue({
        docs: [
          {
            id: 'r1',
            data: () => ({
              nomeHospede: 'Joao',
              status: 'confirmada',
              dataCheckIn: { toDate: () => checkIn },
              dataCheckOut: { toDate: () => checkOut },
              criadoEm: { toDate: () => criado },
            }),
          },
        ],
      });

      const result = await getReservas('empresa-1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('r1');
      expect(result[0].nomeHospede).toBe('Joao');
      expect(result[0].dataCheckIn).toEqual(checkIn);
      expect(result[0].dataCheckOut).toEqual(checkOut);
      expect(result[0].criadoEm).toEqual(criado);
    });

    it('should handle string dates (no toDate method)', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [
          {
            id: 'r2',
            data: () => ({
              nomeHospede: 'Maria',
              dataCheckIn: '2026-04-01',
              dataCheckOut: '2026-04-03',
              criadoEm: null,
            }),
          },
        ],
      });

      const result = await getReservas('empresa-1');
      expect(result[0].dataCheckIn).toBeInstanceOf(Date);
      expect(result[0].dataCheckOut).toBeInstanceOf(Date);
    });

    it('should return empty array when no reservas', async () => {
      mockGetDocs.mockResolvedValue({ docs: [] });
      const result = await getReservas('empresa-1');
      expect(result).toEqual([]);
    });

    it('should query with orderBy criadoEm desc', async () => {
      mockGetDocs.mockResolvedValue({ docs: [] });
      await getReservas('empresa-1');
      expect(mockOrderBy).toHaveBeenCalledWith('criadoEm', 'desc');
    });

    it('should throw when empresaId is empty', async () => {
      await expect(getReservas('')).rejects.toThrow('empresaId is required');
    });

    it('should throw when empresaId is null', async () => {
      await expect(getReservas(null)).rejects.toThrow('empresaId is required');
    });

    it('should throw when empresaId contains path separator', async () => {
      await expect(getReservas('a/b')).rejects.toThrow('must not contain path separators');
    });
  });

  describe('onReservas', () => {
    it('should setup onSnapshot listener with limit(500) and return unsubscribe', () => {
      const callback = vi.fn();
      const unsubscribe = vi.fn();
      mockOnSnapshot.mockReturnValue(unsubscribe);

      const result = onReservas('empresa-1', callback);

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
      const checkIn = new Date('2026-05-01');

      onReservas('empresa-1', callback);

      snapshotCallback({
        docs: [
          {
            id: 'r1',
            data: () => ({
              nomeHospede: 'Ana',
              dataCheckIn: { toDate: () => checkIn },
              dataCheckOut: { toDate: () => new Date('2026-05-03') },
              criadoEm: { toDate: () => new Date() },
            }),
          },
        ],
      });

      expect(callback).toHaveBeenCalledTimes(1);
      const mapped = callback.mock.calls[0][0];
      expect(mapped[0].id).toBe('r1');
      expect(mapped[0].dataCheckIn).toEqual(checkIn);
    });

    it('should throw when empresaId is empty', () => {
      expect(() => onReservas('', vi.fn())).toThrow('empresaId is required');
    });
  });

  describe('addReserva', () => {
    it('should create reserva + update quarto + create fluxoCaixa in batch', async () => {
      let docCallCount = 0;
      mockDoc.mockImplementation((...args) => {
        docCallCount++;
        if (docCallCount === 1) return { id: 'r1' }; // reservaRef
        if (docCallCount === 2) return 'quarto-ref'; // quartoRef
        return { id: 'fc1' }; // fluxoCaixa ref
      });
      mockCollection.mockReturnValue('mock-collection');

      const result = await addReserva('emp-1', {
        nomeHospede: 'Joao',
        quartoId: 'q1',
        numeroQuarto: 101,
        valorTotal: 500,
        dataCheckIn: new Date('2026-04-01'),
        dataCheckOut: new Date('2026-04-03'),
      });

      expect(result).toBe('r1');
      expect(mockBatchSet).toHaveBeenCalledTimes(2); // reserva + fluxoCaixa
      expect(mockBatchUpdate).toHaveBeenCalledTimes(1); // quarto status
      expect(mockBatchCommit).toHaveBeenCalledTimes(1);
    });

    it('should set reserva status to confirmada by default', async () => {
      mockDoc.mockReturnValue({ id: 'r1' });

      await addReserva('emp-1', {
        nomeHospede: 'Test',
        quartoId: 'q1',
        valorTotal: 100,
        dataCheckIn: new Date('2026-04-01'),
        dataCheckOut: new Date('2026-04-02'),
      });

      const reservaData = mockBatchSet.mock.calls[0][1];
      expect(reservaData.status).toBe('confirmada');
    });

    it('should preserve custom status if provided', async () => {
      mockDoc.mockReturnValue({ id: 'r1' });

      await addReserva('emp-1', {
        nomeHospede: 'Test',
        status: 'pendente',
        quartoId: 'q1',
        valorTotal: 100,
        dataCheckIn: new Date('2026-04-01'),
        dataCheckOut: new Date('2026-04-02'),
      });

      const reservaData = mockBatchSet.mock.calls[0][1];
      expect(reservaData.status).toBe('pendente');
    });

    it('should create fluxoCaixa entry with tipo entrada', async () => {
      mockDoc.mockReturnValue({ id: 'r1' });

      await addReserva('emp-1', {
        nomeHospede: 'Carlos',
        quartoId: 'q1',
        numeroQuarto: 205,
        valorTotal: 750,
        dataCheckIn: new Date('2026-04-01'),
        dataCheckOut: new Date('2026-04-03'),
      });

      // Second batch.set call is fluxoCaixa
      const fcData = mockBatchSet.mock.calls[1][1];
      expect(fcData.tipo).toBe('entrada');
      expect(fcData.categoria).toBe('Hospedagem');
      expect(fcData.valor).toBe(750);
      expect(fcData.reservaId).toBe('r1');
    });

    it('should skip quarto update when quartoId is falsy', async () => {
      mockDoc.mockReturnValue({ id: 'r1' });

      await addReserva('emp-1', {
        nomeHospede: 'Test',
        valorTotal: 100,
        dataCheckIn: new Date('2026-04-01'),
        dataCheckOut: new Date('2026-04-02'),
      });

      expect(mockBatchUpdate).not.toHaveBeenCalled();
      expect(mockBatchSet).toHaveBeenCalledTimes(2); // reserva + fluxoCaixa
    });

    it('should throw when empresaId is empty', async () => {
      await expect(addReserva('', {})).rejects.toThrow('empresaId is required');
    });
  });

  describe('updateReserva', () => {
    it('should update document with atualizadoEm timestamp', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await updateReserva('emp-1', 'r1', { nomeHospede: 'Joao Updated' });

      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-doc', {
        nomeHospede: 'Joao Updated',
        atualizadoEm: 'SERVER_TS',
      });
    });

    it('should call doc with correct path', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);
      await updateReserva('emp-1', 'r1', {});
      expect(mockDoc).toHaveBeenCalledWith('mock-db', 'empresas', 'emp-1', 'reservas', 'r1');
    });

    it('should throw when empresaId is empty', async () => {
      await expect(updateReserva('', 'r1', {})).rejects.toThrow('empresaId is required');
    });
  });

  describe('checkoutReserva', () => {
    it('should batch update reserva to concluida and quarto to limpeza', async () => {
      const docRefs = [];
      mockDoc.mockImplementation((...args) => {
        const ref = `doc-ref-${docRefs.length}`;
        docRefs.push(ref);
        return ref;
      });

      await checkoutReserva('emp-1', 'r1', 'q1');

      expect(mockBatchUpdate).toHaveBeenCalledTimes(2);

      // First call: reserva update
      expect(mockBatchUpdate.mock.calls[0][1]).toEqual({
        status: 'concluida',
        atualizadoEm: 'SERVER_TS',
      });

      // Second call: quarto update
      expect(mockBatchUpdate.mock.calls[1][1]).toEqual({
        status: 'limpeza',
        atualizadoEm: 'SERVER_TS',
      });

      expect(mockBatchCommit).toHaveBeenCalledTimes(1);
    });

    it('should throw when empresaId is empty', async () => {
      await expect(checkoutReserva('', 'r1', 'q1')).rejects.toThrow('empresaId is required');
    });
  });

  describe('cancelarReserva', () => {
    it('should batch update reserva to cancelada and quarto to disponivel', async () => {
      mockDoc.mockReturnValue('mock-doc');

      await cancelarReserva('emp-1', 'r1', 'q1');

      expect(mockBatchUpdate).toHaveBeenCalledTimes(2);

      expect(mockBatchUpdate.mock.calls[0][1]).toEqual({
        status: 'cancelada',
        atualizadoEm: 'SERVER_TS',
      });

      expect(mockBatchUpdate.mock.calls[1][1]).toEqual({
        status: 'disponivel',
        atualizadoEm: 'SERVER_TS',
      });

      expect(mockBatchCommit).toHaveBeenCalledTimes(1);
    });

    it('should throw when empresaId is empty', async () => {
      await expect(cancelarReserva('', 'r1', 'q1')).rejects.toThrow('empresaId is required');
    });

    it('should throw when empresaId contains path separator', async () => {
      await expect(cancelarReserva('a/b', 'r1', 'q1')).rejects.toThrow(
        'must not contain path separators'
      );
    });
  });
});
