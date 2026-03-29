import { FluxoCaixaService } from './fluxo-caixa.service';

const mockRepo = {
  findAndCount: jest.fn(),
  create: jest.fn((data) => data),
  save: jest.fn((entity) => Promise.resolve({ id: 'fc-1', ...entity })),
};

const mockWsGateway = {
  emitToEmpresa: jest.fn(),
};

function createService(): FluxoCaixaService {
  return new FluxoCaixaService(mockRepo as any, mockWsGateway as any);
}

describe('FluxoCaixaService', () => {
  let service: FluxoCaixaService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = createService();
  });

  describe('create', () => {
    it('should save fluxo and emit websocket event', async () => {
      const dto = { descricao: 'Receita', valor: 500, tipo: 'entrada' };

      const result = await service.create('emp-1', dto as any);

      expect(result).toHaveProperty('id', 'fc-1');
      expect(mockRepo.create).toHaveBeenCalledWith({
        ...dto,
        empresaId: 'emp-1',
      });
      expect(mockWsGateway.emitToEmpresa).toHaveBeenCalledWith(
        'emp-1',
        'fluxoCaixa:changed',
      );
    });
  });

  describe('findAll', () => {
    it('should order by data DESC then createdAt DESC', async () => {
      mockRepo.findAndCount.mockResolvedValue([[{ id: 'fc-1' }], 1]);

      const result = await service.findAll('emp-1', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(mockRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { data: 'DESC', createdAt: 'DESC' },
          skip: 0,
          take: 20,
        }),
      );
    });

    it('should apply pagination correctly', async () => {
      mockRepo.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll('emp-1', { page: 3, limit: 10 });

      expect(result.meta.page).toBe(3);
      expect(mockRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        }),
      );
    });
  });
});
