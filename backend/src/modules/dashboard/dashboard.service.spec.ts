import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { DashboardService } from './dashboard.service';
import { Quarto } from '../quartos/entities/quarto.entity';
import { FluxoCaixa } from '../fluxo-caixa/entities/fluxo-caixa.entity';
import { Reserva } from '../reservas/entities/reserva.entity';

const EMPRESA_ID = 'empresa-123';

const makeQueryBuilder = (rawResult: Record<string, any> = {}) => ({
  select: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  getRawOne: jest.fn().mockResolvedValue(rawResult),
  getCount: jest.fn().mockResolvedValue(0),
});

describe('DashboardService', () => {
  let service: DashboardService;

  const mockQuartoRepo = {
    find: jest.fn(),
  };

  const mockFluxoQb = makeQueryBuilder({ total: '1500.00' });
  const mockFluxoRepo = {
    createQueryBuilder: jest.fn().mockReturnValue(mockFluxoQb),
  };

  const mockReservaQb = makeQueryBuilder();
  const mockReservaRepo = {
    createQueryBuilder: jest
      .fn()
      .mockReturnValue(mockReservaQb),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    // Reset query builders
    Object.assign(
      mockFluxoQb,
      makeQueryBuilder({ total: '1500.00' }),
    );
    Object.assign(mockReservaQb, makeQueryBuilder());

    mockFluxoRepo.createQueryBuilder.mockReturnValue(mockFluxoQb);
    mockReservaRepo.createQueryBuilder.mockReturnValue(
      mockReservaQb,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getRepositoryToken(Quarto),
          useValue: mockQuartoRepo,
        },
        {
          provide: getRepositoryToken(FluxoCaixa),
          useValue: mockFluxoRepo,
        },
        {
          provide: getRepositoryToken(Reserva),
          useValue: mockReservaRepo,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  describe('getStats', () => {
    it('should return all 5 stat categories', async () => {
      // Arrange
      mockQuartoRepo.find.mockResolvedValue([]);

      // Act
      const result = await service.getStats(EMPRESA_ID);

      // Assert
      expect(result).toHaveProperty('quartos');
      expect(result).toHaveProperty('receita');
      expect(result).toHaveProperty('despesas');
      expect(result).toHaveProperty('checkins');
      expect(result).toHaveProperty('checkouts');
    });

    it('should run all queries in parallel via Promise.all', async () => {
      // Arrange
      mockQuartoRepo.find.mockResolvedValue([]);
      const promiseAllSpy = jest.spyOn(Promise, 'all');

      // Act
      await service.getStats(EMPRESA_ID);

      // Assert
      expect(promiseAllSpy).toHaveBeenCalled();
      const callArg = promiseAllSpy.mock.calls[0][0];
      expect(callArg).toHaveLength(5);

      promiseAllSpy.mockRestore();
    });
  });

  describe('getQuartosStats (via getStats)', () => {
    it('should return correct total, ocupados, disponiveis', async () => {
      // Arrange
      mockQuartoRepo.find.mockResolvedValue([
        { id: '1', status: 'ocupado' },
        { id: '2', status: 'ocupado' },
        { id: '3', status: 'disponivel' },
        { id: '4', status: 'limpeza' },
        { id: '5', status: 'disponivel' },
      ]);

      // Act
      const result = await service.getStats(EMPRESA_ID);

      // Assert
      expect(result.quartos.total).toBe(5);
      expect(result.quartos.ocupados).toBe(2);
      expect(result.quartos.disponiveis).toBe(2);
    });

    it('should calculate taxaOcupacao = round((ocupados/total)*100)', async () => {
      // Arrange — 3 ocupados out of 10 = 30%
      const quartos = [
        ...Array(3).fill({ status: 'ocupado' }),
        ...Array(7).fill({ status: 'disponivel' }),
      ].map((q, i) => ({ id: String(i), ...q }));
      mockQuartoRepo.find.mockResolvedValue(quartos);

      // Act
      const result = await service.getStats(EMPRESA_ID);

      // Assert
      expect(result.quartos.taxaOcupacao).toBe(30);
    });

    it('should round taxaOcupacao correctly (e.g. 33.33 -> 33)', async () => {
      // Arrange — 1 ocupado out of 3 = 33.33%
      mockQuartoRepo.find.mockResolvedValue([
        { id: '1', status: 'ocupado' },
        { id: '2', status: 'disponivel' },
        { id: '3', status: 'disponivel' },
      ]);

      // Act
      const result = await service.getStats(EMPRESA_ID);

      // Assert
      expect(result.quartos.taxaOcupacao).toBe(33);
    });

    it('should return taxaOcupacao=0 when zero quartos', async () => {
      // Arrange
      mockQuartoRepo.find.mockResolvedValue([]);

      // Act
      const result = await service.getStats(EMPRESA_ID);

      // Assert
      expect(result.quartos.taxaOcupacao).toBe(0);
      expect(result.quartos.total).toBe(0);
    });
  });

  describe('getReceitaStats (via getStats)', () => {
    it('should sum FluxoCaixa tipo=entrada for current month', async () => {
      // Arrange
      mockQuartoRepo.find.mockResolvedValue([]);
      mockFluxoQb.getRawOne.mockResolvedValue({
        total: '3200.50',
      });

      // Act
      const result = await service.getStats(EMPRESA_ID);

      // Assert
      expect(result.receita.mes).toBe(3200.5);
      expect(mockFluxoQb.andWhere).toHaveBeenCalledWith(
        'fc.tipo = :tipo',
        { tipo: 'entrada' },
      );
    });

    it('should return 0 when no receita data', async () => {
      // Arrange
      mockQuartoRepo.find.mockResolvedValue([]);
      mockFluxoQb.getRawOne.mockResolvedValue({ total: '0' });

      // Act
      const result = await service.getStats(EMPRESA_ID);

      // Assert
      expect(result.receita.mes).toBe(0);
    });

    it('should handle null result gracefully', async () => {
      // Arrange
      mockQuartoRepo.find.mockResolvedValue([]);
      mockFluxoQb.getRawOne.mockResolvedValue(null);

      // Act
      const result = await service.getStats(EMPRESA_ID);

      // Assert
      expect(result.receita.mes).toBe(0);
      expect(result.receita.ano).toBe(0);
    });
  });

  describe('getDespesasStats (via getStats)', () => {
    it('should sum FluxoCaixa tipo=saida for current month', async () => {
      // Arrange
      mockQuartoRepo.find.mockResolvedValue([]);

      // We need separate query builders for receita and despesa
      // The service creates 3 query builders for fluxo
      // (2 receita + 1 despesa)
      const qb1 = makeQueryBuilder({ total: '1000.00' });
      const qb2 = makeQueryBuilder({ total: '5000.00' });
      const qb3 = makeQueryBuilder({ total: '800.00' });

      mockFluxoRepo.createQueryBuilder
        .mockReturnValueOnce(qb1) // receita mes
        .mockReturnValueOnce(qb2) // receita ano
        .mockReturnValueOnce(qb3); // despesas mes

      // Act
      const result = await service.getStats(EMPRESA_ID);

      // Assert
      expect(result.despesas.mes).toBe(800);
    });

    it('should return 0 when no despesas', async () => {
      // Arrange
      mockQuartoRepo.find.mockResolvedValue([]);

      const qb1 = makeQueryBuilder({ total: '0' });
      const qb2 = makeQueryBuilder({ total: '0' });
      const qb3 = makeQueryBuilder({ total: '0' });

      mockFluxoRepo.createQueryBuilder
        .mockReturnValueOnce(qb1)
        .mockReturnValueOnce(qb2)
        .mockReturnValueOnce(qb3);

      // Act
      const result = await service.getStats(EMPRESA_ID);

      // Assert
      expect(result.despesas.mes).toBe(0);
    });
  });

  describe('getCheckinsHoje (via getStats)', () => {
    it('should count reservas with today checkin and valid statuses', async () => {
      // Arrange
      mockQuartoRepo.find.mockResolvedValue([]);
      mockReservaQb.getCount.mockResolvedValue(3);

      // Act
      const result = await service.getStats(EMPRESA_ID);

      // Assert
      expect(result.checkins.hoje).toBe(3);
      expect(mockReservaQb.andWhere).toHaveBeenCalledWith(
        'r.status IN (:...statuses)',
        { statuses: ['confirmada', 'checkin'] },
      );
    });

    it('should exclude canceled reservas from checkins', async () => {
      // Arrange
      mockQuartoRepo.find.mockResolvedValue([]);

      // Act
      await service.getStats(EMPRESA_ID);

      // Assert — 'cancelada' should NOT be in statuses
      const statusCalls = mockReservaQb.andWhere.mock.calls.filter(
        ([query]) =>
          typeof query === 'string' &&
          query.includes('status'),
      );

      const checkinStatusCall = statusCalls[0];
      expect(checkinStatusCall).toBeDefined();
      expect(checkinStatusCall[1].statuses).not.toContain(
        'cancelada',
      );
    });
  });

  describe('getCheckoutsHoje (via getStats)', () => {
    it('should count reservas with today checkout', async () => {
      // Arrange
      mockQuartoRepo.find.mockResolvedValue([]);

      // Two query builders for reserva:
      // checkins and checkouts
      const checkinQb = makeQueryBuilder();
      checkinQb.getCount.mockResolvedValue(2);
      const checkoutQb = makeQueryBuilder();
      checkoutQb.getCount.mockResolvedValue(5);

      mockReservaRepo.createQueryBuilder
        .mockReturnValueOnce(checkinQb)
        .mockReturnValueOnce(checkoutQb);

      // Act
      const result = await service.getStats(EMPRESA_ID);

      // Assert
      expect(result.checkouts.hoje).toBe(5);
    });

    it('should filter checkouts by status checkin or checkout', async () => {
      // Arrange
      mockQuartoRepo.find.mockResolvedValue([]);

      const checkinQb = makeQueryBuilder();
      const checkoutQb = makeQueryBuilder();
      checkoutQb.getCount.mockResolvedValue(1);

      mockReservaRepo.createQueryBuilder
        .mockReturnValueOnce(checkinQb)
        .mockReturnValueOnce(checkoutQb);

      // Act
      await service.getStats(EMPRESA_ID);

      // Assert
      expect(checkoutQb.andWhere).toHaveBeenCalledWith(
        'r.status IN (:...statuses)',
        { statuses: ['checkin', 'checkout'] },
      );
    });
  });
});
