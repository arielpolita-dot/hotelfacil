import { NotFoundException } from '@nestjs/common';
import { FaturasService } from './faturas.service';

const mockRepo = {
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn((data) => data),
  save: jest.fn((entity) => Promise.resolve({ id: 'fat-1', ...entity })),
  remove: jest.fn(),
};

const mockWsGateway = {
  emitToEmpresa: jest.fn(),
};

function createService(): FaturasService {
  return new FaturasService(mockRepo as any, mockWsGateway as any);
}

describe('FaturasService', () => {
  let service: FaturasService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = createService();
  });

  describe('create', () => {
    it('should save fatura and emit websocket event', async () => {
      const dto = { descricao: 'Fatura 1', valor: 100 };

      const result = await service.create('emp-1', dto as any);

      expect(result).toHaveProperty('id', 'fat-1');
      expect(mockRepo.create).toHaveBeenCalledWith({
        ...dto,
        empresaId: 'emp-1',
      });
      expect(mockWsGateway.emitToEmpresa).toHaveBeenCalledWith(
        'emp-1',
        'faturas:changed',
      );
    });
  });

  describe('update', () => {
    it('should apply partial update with Object.assign', async () => {
      const existing = { id: 'f-1', descricao: 'Old', valor: 50 };
      mockRepo.findOne.mockResolvedValue({ ...existing });

      await service.update('emp-1', 'f-1', { descricao: 'New' } as any);

      const savedEntity = mockRepo.save.mock.calls[0][0];
      expect(savedEntity.descricao).toBe('New');
      expect(savedEntity.valor).toBe(50);
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      mockRepo.findAndCount.mockResolvedValue([
        [{ id: 'f-1' }],
        1,
      ]);

      const result = await service.findAll('emp-1', { page: 2, limit: 5 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.page).toBe(2);
      expect(mockRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { createdAt: 'DESC' },
          skip: 5,
          take: 5,
        }),
      );
    });
  });

  describe('remove', () => {
    it('should remove fatura and emit event', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 'f-1' });

      await service.remove('emp-1', 'f-1');

      expect(mockRepo.remove).toHaveBeenCalledWith({ id: 'f-1' });
      expect(mockWsGateway.emitToEmpresa).toHaveBeenCalledWith(
        'emp-1',
        'faturas:changed',
      );
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.remove('emp-1', 'x')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
