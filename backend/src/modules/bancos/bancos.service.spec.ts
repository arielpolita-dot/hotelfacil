import { NotFoundException } from '@nestjs/common';
import { BancosService } from './bancos.service';

const mockRepo = {
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn((data) => data),
  save: jest.fn((entity) =>
    Promise.resolve(
      Array.isArray(entity)
        ? entity.map((e, i) => ({ id: `bank-${i}`, ...e }))
        : { id: 'bank-1', ...entity },
    ),
  ),
  remove: jest.fn(),
  count: jest.fn(),
  find: jest.fn(),
};

const mockWsGateway = {
  emitToEmpresa: jest.fn(),
};

function createService(): BancosService {
  return new BancosService(mockRepo as any, mockWsGateway as any);
}

describe('BancosService', () => {
  let service: BancosService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = createService();
  });

  describe('create', () => {
    it('should save banco and emit websocket event', async () => {
      const dto = { nome: 'Nubank', codigo: '260' };

      const result = await service.create('emp-1', dto as any);

      expect(result).toHaveProperty('id', 'bank-1');
      expect(result).toHaveProperty('nome', 'Nubank');
      expect(mockWsGateway.emitToEmpresa).toHaveBeenCalledWith(
        'emp-1',
        'bancos:changed',
      );
    });
  });

  describe('update', () => {
    it('should update with Object.assign and emit event', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 'b-1', nome: 'Old' });

      const result = await service.update('emp-1', 'b-1', {
        nome: 'New',
      } as any);

      expect(mockRepo.save).toHaveBeenCalled();
      expect(mockWsGateway.emitToEmpresa).toHaveBeenCalledWith(
        'emp-1',
        'bancos:changed',
      );
    });
  });

  describe('remove', () => {
    it('should remove banco and emit event', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 'b-1' });

      await service.remove('emp-1', 'b-1');

      expect(mockRepo.remove).toHaveBeenCalledWith({ id: 'b-1' });
      expect(mockWsGateway.emitToEmpresa).toHaveBeenCalledWith(
        'emp-1',
        'bancos:changed',
      );
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.remove('emp-1', 'x')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('seed', () => {
    it('should create 9 default banks on first call', async () => {
      mockRepo.count.mockResolvedValue(0);

      const result = await service.seed('emp-1');

      expect(mockRepo.create).toHaveBeenCalledTimes(9);
      expect(mockRepo.save).toHaveBeenCalledWith(expect.any(Array));
      expect(result).toHaveLength(9);
    });

    it('should return existing banks without duplicates on second call', async () => {
      mockRepo.count.mockResolvedValue(9);
      mockRepo.find.mockResolvedValue([{ nome: 'Itau' }]);

      const result = await service.seed('emp-1');

      expect(mockRepo.create).not.toHaveBeenCalled();
      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { empresaId: 'emp-1' },
        order: { nome: 'ASC' },
      });
    });

    it('should include correct bank names and codes', async () => {
      mockRepo.count.mockResolvedValue(0);

      await service.seed('emp-1');

      const createdBanks = mockRepo.create.mock.calls.map((c) => c[0]);
      const names = createdBanks.map((b) => b.nome);

      expect(names).toContain('Banco do Brasil');
      expect(names).toContain('Nubank');
      expect(names).toContain('PagBank');

      const bb = createdBanks.find((b) => b.nome === 'Banco do Brasil');
      expect(bb.codigo).toBe('001');
    });
  });
});
