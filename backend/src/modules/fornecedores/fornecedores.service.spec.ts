import { NotFoundException } from '@nestjs/common';
import { FornecedoresService } from './fornecedores.service';

const mockRepo = {
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn((data) => data),
  save: jest.fn((entity) => Promise.resolve({ id: 'forn-1', ...entity })),
  remove: jest.fn(),
};

const mockWsGateway = {
  emitToEmpresa: jest.fn(),
};

function createService(): FornecedoresService {
  return new FornecedoresService(mockRepo as any, mockWsGateway as any);
}

describe('FornecedoresService', () => {
  let service: FornecedoresService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = createService();
  });

  describe('create', () => {
    it('should save fornecedor and emit websocket event', async () => {
      const dto = { nome: 'Fornecedor A', cnpj: '123' };

      const result = await service.create('emp-1', dto as any);

      expect(result).toHaveProperty('id', 'forn-1');
      expect(mockWsGateway.emitToEmpresa).toHaveBeenCalledWith(
        'emp-1',
        'fornecedores:changed',
      );
    });
  });

  describe('findAll', () => {
    it('should return results ordered by nome ASC with pagination', async () => {
      mockRepo.findAndCount.mockResolvedValue([[{ id: 'f1' }], 1]);

      const result = await service.findAll('emp-1', { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(mockRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { nome: 'ASC' },
          skip: 0,
          take: 10,
        }),
      );
    });
  });

  describe('remove', () => {
    it('should remove fornecedor and emit event', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 'f-1' });

      await service.remove('emp-1', 'f-1');

      expect(mockRepo.remove).toHaveBeenCalledWith({ id: 'f-1' });
      expect(mockWsGateway.emitToEmpresa).toHaveBeenCalledWith(
        'emp-1',
        'fornecedores:changed',
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
