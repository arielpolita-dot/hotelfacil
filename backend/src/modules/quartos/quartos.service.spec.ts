import { NotFoundException } from '@nestjs/common';
import { QuartosService } from './quartos.service';

const mockRepo = {
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn((data) => data),
  save: jest.fn((entity) => Promise.resolve({ id: 'q-1', ...entity })),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockWsGateway = {
  emitToEmpresa: jest.fn(),
};

function createService(): QuartosService {
  return new QuartosService(mockRepo as any, mockWsGateway as any);
}

describe('QuartosService', () => {
  let service: QuartosService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = createService();
  });

  describe('create', () => {
    it('should save quarto and emit websocket event', async () => {
      const dto = { numero: 101, tipo: 'standard' };

      const result = await service.create('emp-1', dto as any);

      expect(result).toHaveProperty('id', 'q-1');
      expect(mockWsGateway.emitToEmpresa).toHaveBeenCalledWith(
        'emp-1',
        'quartos:changed',
      );
    });
  });

  describe('findAll', () => {
    it('should return results ordered by numero ASC with pagination', async () => {
      mockRepo.findAndCount.mockResolvedValue([[{ id: 'q-1' }], 1]);

      const result = await service.findAll('emp-1', { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(mockRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { numero: 'ASC' },
          skip: 0,
          take: 10,
        }),
      );
    });

    it('should calculate pagination offset correctly', async () => {
      mockRepo.findAndCount.mockResolvedValue([[], 50]);

      const result = await service.findAll('emp-1', { page: 3, limit: 10 });

      expect(result.meta.totalPages).toBe(5);
      expect(result.meta.hasMore).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('emp-1', 'x')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and emit websocket event', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 'q-1', numero: 101 });

      await service.update('emp-1', 'q-1', { tipo: 'suite' } as any);

      expect(mockRepo.update).toHaveBeenCalledWith(
        { id: 'q-1', empresaId: 'emp-1' },
        { tipo: 'suite' },
      );
      expect(mockWsGateway.emitToEmpresa).toHaveBeenCalledWith(
        'emp-1',
        'quartos:changed',
      );
    });
  });

  describe('remove', () => {
    it('should delete quarto and emit event', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 'q-1' });

      await service.remove('emp-1', 'q-1');

      expect(mockRepo.delete).toHaveBeenCalledWith({
        id: 'q-1',
        empresaId: 'emp-1',
      });
      expect(mockWsGateway.emitToEmpresa).toHaveBeenCalledWith(
        'emp-1',
        'quartos:changed',
      );
    });
  });
});
