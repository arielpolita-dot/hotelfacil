import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { DespesasService } from './despesas.service';
import { Despesa } from './entities/despesa.entity';
import { FluxoCaixa } from '../fluxo-caixa/entities/fluxo-caixa.entity';
import { HotelWebSocketGateway } from '../websocket/websocket.gateway';
import {
  CategoriaDespesa,
  TipoFluxoCaixa,
} from '../../common/enums';
import { CreateDespesaDto } from './dto/create-despesa.dto';

const EMPRESA_ID = 'empresa-123';
const DESPESA_ID = 'despesa-456';

const makeDto = (
  overrides: Partial<CreateDespesaDto> = {},
): CreateDespesaDto => ({
  categoria: CategoriaDespesa.MANUTENCAO,
  descricao: 'Conserto ar-condicionado',
  valor: 250,
  data: '2026-03-28',
  ...overrides,
});

describe('DespesasService', () => {
  let service: DespesasService;

  const mockRepo = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockManager = {
    create: jest.fn().mockImplementation((_Entity, data) => ({
      ...data,
    })),
    save: jest.fn().mockImplementation((entity) => ({
      ...entity,
      id: entity.id ?? 'new-despesa-id',
    })),
  };

  const mockDataSource = {
    transaction: jest
      .fn()
      .mockImplementation(async (cb) => cb(mockManager)),
  };

  const mockWsGateway = {
    emitToEmpresa: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DespesasService,
        {
          provide: getRepositoryToken(Despesa),
          useValue: mockRepo,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: HotelWebSocketGateway,
          useValue: mockWsGateway,
        },
      ],
    }).compile();

    service = module.get<DespesasService>(DespesasService);
  });

  describe('create', () => {
    it('should create despesa + fluxoCaixa in transaction', async () => {
      // Arrange
      const dto = makeDto();

      // Act
      const result = await service.create(EMPRESA_ID, dto);

      // Assert
      expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);
      expect(mockManager.create).toHaveBeenCalledWith(
        Despesa,
        expect.objectContaining({
          categoria: CategoriaDespesa.MANUTENCAO,
          descricao: 'Conserto ar-condicionado',
          empresaId: EMPRESA_ID,
        }),
      );
      expect(mockManager.create).toHaveBeenCalledWith(
        FluxoCaixa,
        expect.objectContaining({
          empresaId: EMPRESA_ID,
        }),
      );
      expect(mockManager.save).toHaveBeenCalledTimes(2);
      expect(result).toBeDefined();
    });

    it('should set fluxoCaixa tipo=saida and categoria matching despesa', async () => {
      // Arrange
      const dto = makeDto({
        categoria: CategoriaDespesa.LIMPEZA,
      });

      // Act
      await service.create(EMPRESA_ID, dto);

      // Assert
      const fluxoCall = mockManager.create.mock.calls.find(
        ([entity]) => entity === FluxoCaixa,
      );
      expect(fluxoCall![1].tipo).toBe(TipoFluxoCaixa.SAIDA);
      expect(fluxoCall![1].categoria).toBe(
        CategoriaDespesa.LIMPEZA,
      );
    });

    it('should set fluxoCaixa.valor = dto.valor', async () => {
      // Arrange
      const dto = makeDto({ valor: 780.5 });

      // Act
      await service.create(EMPRESA_ID, dto);

      // Assert
      const fluxoCall = mockManager.create.mock.calls.find(
        ([entity]) => entity === FluxoCaixa,
      );
      expect(fluxoCall![1].valor).toBe(780.5);
    });

    it('should link fluxoCaixa.despesaId to saved despesa id', async () => {
      // Arrange
      const dto = makeDto();
      mockManager.save.mockImplementationOnce((entity) => ({
        ...entity,
        id: 'saved-despesa-id',
      }));

      // Act
      await service.create(EMPRESA_ID, dto);

      // Assert
      const fluxoCall = mockManager.create.mock.calls.find(
        ([entity]) => entity === FluxoCaixa,
      );
      expect(fluxoCall![1].despesaId).toBe('saved-despesa-id');
    });

    it('should emit despesas:changed and fluxoCaixa:changed', async () => {
      // Arrange
      const dto = makeDto();

      // Act
      await service.create(EMPRESA_ID, dto);

      // Assert
      expect(mockWsGateway.emitToEmpresa).toHaveBeenCalledTimes(
        2,
      );
      expect(mockWsGateway.emitToEmpresa).toHaveBeenCalledWith(
        EMPRESA_ID,
        'despesas:changed',
      );
      expect(mockWsGateway.emitToEmpresa).toHaveBeenCalledWith(
        EMPRESA_ID,
        'fluxoCaixa:changed',
      );
    });

    it('should not emit events if transaction fails', async () => {
      // Arrange
      const dto = makeDto();
      mockDataSource.transaction.mockRejectedValueOnce(
        new Error('DB error'),
      );

      // Act & Assert
      await expect(
        service.create(EMPRESA_ID, dto),
      ).rejects.toThrow('DB error');
      expect(mockWsGateway.emitToEmpresa).not.toHaveBeenCalled();
    });

    it('should pass dto.descricao to fluxoCaixa.descricao', async () => {
      // Arrange
      const dto = makeDto({
        descricao: 'Troca de lampadas',
      });

      // Act
      await service.create(EMPRESA_ID, dto);

      // Assert
      const fluxoCall = mockManager.create.mock.calls.find(
        ([entity]) => entity === FluxoCaixa,
      );
      expect(fluxoCall![1].descricao).toBe('Troca de lampadas');
    });
  });

  describe('update', () => {
    it('should update despesa and emit events', async () => {
      // Arrange
      const despesa = {
        id: DESPESA_ID,
        empresaId: EMPRESA_ID,
      };
      mockRepo.findOne.mockResolvedValue(despesa);

      // Act
      await service.update(EMPRESA_ID, DESPESA_ID, {
        descricao: 'Updated',
      });

      // Assert
      expect(mockRepo.update).toHaveBeenCalledWith(
        { id: DESPESA_ID, empresaId: EMPRESA_ID },
        { descricao: 'Updated' },
      );
      expect(mockWsGateway.emitToEmpresa).toHaveBeenCalledWith(
        EMPRESA_ID,
        'despesas:changed',
      );
    });

    it('should throw NotFoundException when not found', async () => {
      // Arrange
      mockRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.update(EMPRESA_ID, 'non-existent', {
          descricao: 'x',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete despesa and emit events', async () => {
      // Arrange
      mockRepo.findOne.mockResolvedValue({
        id: DESPESA_ID,
        empresaId: EMPRESA_ID,
      });

      // Act
      await service.remove(EMPRESA_ID, DESPESA_ID);

      // Assert
      expect(mockRepo.delete).toHaveBeenCalledWith({
        id: DESPESA_ID,
        empresaId: EMPRESA_ID,
      });
      expect(mockWsGateway.emitToEmpresa).toHaveBeenCalledTimes(
        2,
      );
    });

    it('should throw NotFoundException when not found', async () => {
      // Arrange
      mockRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.remove(EMPRESA_ID, 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated results ordered by data DESC', async () => {
      // Arrange
      const despesas = [
        { id: 'd1', empresaId: EMPRESA_ID },
        { id: 'd2', empresaId: EMPRESA_ID },
      ];
      mockRepo.findAndCount.mockResolvedValue([despesas, 2]);

      // Act
      const result = await service.findAll(EMPRESA_ID, {
        page: 1,
        limit: 20,
      });

      // Assert
      expect(mockRepo.findAndCount).toHaveBeenCalledWith({
        where: { empresaId: EMPRESA_ID },
        order: { data: 'DESC' },
        skip: 0,
        take: 20,
      });
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });

    it('should calculate pagination correctly', async () => {
      // Arrange
      mockRepo.findAndCount.mockResolvedValue([[], 100]);

      // Act
      await service.findAll(EMPRESA_ID, {
        page: 5,
        limit: 10,
      });

      // Assert
      expect(mockRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 40,
          take: 10,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return despesa when found', async () => {
      // Arrange
      const despesa = {
        id: DESPESA_ID,
        empresaId: EMPRESA_ID,
      };
      mockRepo.findOne.mockResolvedValue(despesa);

      // Act
      const result = await service.findOne(
        EMPRESA_ID,
        DESPESA_ID,
      );

      // Assert
      expect(result).toEqual(despesa);
    });

    it('should throw NotFoundException when not found', async () => {
      // Arrange
      mockRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.findOne(EMPRESA_ID, 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
