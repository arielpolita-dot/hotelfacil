import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { ReservasService } from './reservas.service';
import { Reserva } from './entities/reserva.entity';
import { Quarto } from '../quartos/entities/quarto.entity';
import { FluxoCaixa } from '../fluxo-caixa/entities/fluxo-caixa.entity';
import { HotelWebSocketGateway } from '../websocket/websocket.gateway';
import {
  StatusQuarto,
  StatusReserva,
  TipoFluxoCaixa,
} from '../../common/enums';
import { CreateReservaDto } from './dto/create-reserva.dto';

const EMPRESA_ID = 'empresa-123';
const RESERVA_ID = 'reserva-456';
const QUARTO_ID = 'quarto-789';

const makeDto = (
  overrides: Partial<CreateReservaDto> = {},
): CreateReservaDto => ({
  quartoId: QUARTO_ID,
  nomeHospede: 'Joao Silva',
  adultos: 2,
  dataCheckin: '2026-04-01T14:00:00Z',
  dataCheckout: '2026-04-03T12:00:00Z',
  valorTotal: 500,
  ...overrides,
});

const makeReserva = (
  overrides: Partial<Reserva> = {},
): Partial<Reserva> => ({
  id: RESERVA_ID,
  empresaId: EMPRESA_ID,
  quartoId: QUARTO_ID,
  nomeHospede: 'Joao Silva',
  status: StatusReserva.CONFIRMADA,
  valorTotal: 500,
  quarto: { id: QUARTO_ID } as Quarto,
  ...overrides,
});

describe('ReservasService', () => {
  let service: ReservasService;

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
      id: entity.id ?? 'new-id',
    })),
    update: jest.fn(),
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
        ReservasService,
        {
          provide: getRepositoryToken(Reserva),
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

    service = module.get<ReservasService>(ReservasService);
  });

  describe('create', () => {
    it('should create reserva + update quarto + create fluxoCaixa in transaction', async () => {
      // Arrange
      const dto = makeDto();

      // Act
      const result = await service.create(EMPRESA_ID, dto);

      // Assert
      expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);

      expect(mockManager.create).toHaveBeenCalledWith(
        Reserva,
        expect.objectContaining({
          quartoId: QUARTO_ID,
          nomeHospede: 'Joao Silva',
          empresaId: EMPRESA_ID,
          status: StatusReserva.CONFIRMADA,
        }),
      );

      expect(mockManager.update).toHaveBeenCalledWith(
        Quarto,
        { id: QUARTO_ID, empresaId: EMPRESA_ID },
        { status: StatusQuarto.OCUPADO },
      );

      expect(mockManager.create).toHaveBeenCalledWith(
        FluxoCaixa,
        expect.objectContaining({
          empresaId: EMPRESA_ID,
          tipo: TipoFluxoCaixa.ENTRADA,
          categoria: 'Hospedagem',
          valor: 500,
        }),
      );

      expect(mockManager.save).toHaveBeenCalledTimes(2);
      expect(result).toBeDefined();
    });

    it('should set fluxoCaixa tipo=entrada and categoria=Hospedagem', async () => {
      // Arrange
      const dto = makeDto();

      // Act
      await service.create(EMPRESA_ID, dto);

      // Assert
      const fluxoCall = mockManager.create.mock.calls.find(
        ([entity]) => entity === FluxoCaixa,
      );
      expect(fluxoCall).toBeDefined();
      expect(fluxoCall![1].tipo).toBe(TipoFluxoCaixa.ENTRADA);
      expect(fluxoCall![1].categoria).toBe('Hospedagem');
    });

    it('should set fluxoCaixa.valor = dto.valorTotal', async () => {
      // Arrange
      const dto = makeDto({ valorTotal: 1250.5 });

      // Act
      await service.create(EMPRESA_ID, dto);

      // Assert
      const fluxoCall = mockManager.create.mock.calls.find(
        ([entity]) => entity === FluxoCaixa,
      );
      expect(fluxoCall![1].valor).toBe(1250.5);
    });

    it('should default status to confirmada when not provided', async () => {
      // Arrange
      const dto = makeDto();
      delete (dto as any).status;

      // Act
      await service.create(EMPRESA_ID, dto);

      // Assert
      const reservaCall = mockManager.create.mock.calls.find(
        ([entity]) => entity === Reserva,
      );
      expect(reservaCall![1].status).toBe(
        StatusReserva.CONFIRMADA,
      );
    });

    it('should use provided status when given', async () => {
      // Arrange
      const dto = makeDto({ status: StatusReserva.CHECKIN });

      // Act
      await service.create(EMPRESA_ID, dto);

      // Assert
      const reservaCall = mockManager.create.mock.calls.find(
        ([entity]) => entity === Reserva,
      );
      expect(reservaCall![1].status).toBe(StatusReserva.CHECKIN);
    });

    it('should emit 3 WebSocket events after create', async () => {
      // Arrange
      const dto = makeDto();

      // Act
      await service.create(EMPRESA_ID, dto);

      // Assert
      expect(mockWsGateway.emitToEmpresa).toHaveBeenCalledTimes(
        3,
      );
      expect(mockWsGateway.emitToEmpresa).toHaveBeenCalledWith(
        EMPRESA_ID,
        'reservas:changed',
      );
      expect(mockWsGateway.emitToEmpresa).toHaveBeenCalledWith(
        EMPRESA_ID,
        'quartos:changed',
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

    it('should link fluxoCaixa.reservaId to saved reserva id', async () => {
      // Arrange
      const dto = makeDto();
      mockManager.save.mockImplementationOnce((entity) => ({
        ...entity,
        id: 'saved-reserva-id',
      }));

      // Act
      await service.create(EMPRESA_ID, dto);

      // Assert
      const fluxoCall = mockManager.create.mock.calls.find(
        ([entity]) => entity === FluxoCaixa,
      );
      expect(fluxoCall![1].reservaId).toBe('saved-reserva-id');
    });
  });

  describe('checkout', () => {
    it('should update reserva to concluida and quarto to limpeza', async () => {
      // Arrange
      const reserva = makeReserva();
      mockRepo.findOne.mockResolvedValue(reserva);

      // Act
      await service.checkout(EMPRESA_ID, RESERVA_ID);

      // Assert
      expect(mockManager.update).toHaveBeenCalledWith(
        Reserva,
        { id: RESERVA_ID, empresaId: EMPRESA_ID },
        { status: StatusReserva.CONCLUIDA },
      );
      expect(mockManager.update).toHaveBeenCalledWith(
        Quarto,
        { id: QUARTO_ID, empresaId: EMPRESA_ID },
        { status: StatusQuarto.LIMPEZA },
      );
    });

    it('should emit WebSocket events after checkout', async () => {
      // Arrange
      mockRepo.findOne.mockResolvedValue(makeReserva());

      // Act
      await service.checkout(EMPRESA_ID, RESERVA_ID);

      // Assert
      expect(mockWsGateway.emitToEmpresa).toHaveBeenCalledWith(
        EMPRESA_ID,
        'reservas:changed',
      );
      expect(mockWsGateway.emitToEmpresa).toHaveBeenCalledWith(
        EMPRESA_ID,
        'quartos:changed',
      );
    });

    it('should throw NotFoundException for non-existent reserva', async () => {
      // Arrange
      mockRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.checkout(EMPRESA_ID, 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancel', () => {
    it('should update reserva to cancelada and quarto to disponivel', async () => {
      // Arrange
      mockRepo.findOne.mockResolvedValue(makeReserva());

      // Act
      await service.cancel(EMPRESA_ID, RESERVA_ID);

      // Assert
      expect(mockManager.update).toHaveBeenCalledWith(
        Reserva,
        { id: RESERVA_ID, empresaId: EMPRESA_ID },
        { status: StatusReserva.CANCELADA },
      );
      expect(mockManager.update).toHaveBeenCalledWith(
        Quarto,
        { id: QUARTO_ID, empresaId: EMPRESA_ID },
        { status: StatusQuarto.DISPONIVEL },
      );
    });

    it('should emit WebSocket events after cancel', async () => {
      // Arrange
      mockRepo.findOne.mockResolvedValue(makeReserva());

      // Act
      await service.cancel(EMPRESA_ID, RESERVA_ID);

      // Assert
      expect(
        mockWsGateway.emitToEmpresa,
      ).toHaveBeenCalledTimes(3);
    });

    it('should throw NotFoundException for non-existent reserva', async () => {
      // Arrange
      mockRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.cancel(EMPRESA_ID, 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update only reserva fields, not quarto status', async () => {
      // Arrange
      const reserva = makeReserva();
      mockRepo.findOne.mockResolvedValue(reserva);
      const updateDto = { nomeHospede: 'Maria Santos' };

      // Act
      await service.update(EMPRESA_ID, RESERVA_ID, updateDto);

      // Assert
      expect(mockRepo.update).toHaveBeenCalledWith(
        { id: RESERVA_ID, empresaId: EMPRESA_ID },
        updateDto,
      );
      // Transaction manager should NOT be called
      expect(mockManager.update).not.toHaveBeenCalled();
    });

    it('should emit events after update', async () => {
      // Arrange
      mockRepo.findOne.mockResolvedValue(makeReserva());

      // Act
      await service.update(EMPRESA_ID, RESERVA_ID, {
        nomeHospede: 'Updated',
      });

      // Assert
      expect(
        mockWsGateway.emitToEmpresa,
      ).toHaveBeenCalledTimes(3);
    });
  });

  describe('findAll', () => {
    it('should return paginated results ordered by dataCheckin DESC', async () => {
      // Arrange
      const reservas = [makeReserva(), makeReserva({ id: 'r2' })];
      mockRepo.findAndCount.mockResolvedValue([reservas, 2]);

      // Act
      const result = await service.findAll(EMPRESA_ID, {
        page: 1,
        limit: 20,
      });

      // Assert
      expect(mockRepo.findAndCount).toHaveBeenCalledWith({
        where: { empresaId: EMPRESA_ID },
        relations: ['quarto'],
        order: { dataCheckin: 'DESC' },
        skip: 0,
        take: 20,
      });
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });

    it('should calculate pagination offset correctly', async () => {
      // Arrange
      mockRepo.findAndCount.mockResolvedValue([[], 50]);

      // Act
      await service.findAll(EMPRESA_ID, {
        page: 3,
        limit: 10,
      });

      // Assert
      expect(mockRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        }),
      );
    });

    it('should include quarto relation', async () => {
      // Arrange
      mockRepo.findAndCount.mockResolvedValue([[], 0]);

      // Act
      await service.findAll(EMPRESA_ID, { page: 1, limit: 20 });

      // Assert
      expect(mockRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          relations: ['quarto'],
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return reserva with quarto relation', async () => {
      // Arrange
      const reserva = makeReserva();
      mockRepo.findOne.mockResolvedValue(reserva);

      // Act
      const result = await service.findOne(
        EMPRESA_ID,
        RESERVA_ID,
      );

      // Assert
      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id: RESERVA_ID, empresaId: EMPRESA_ID },
        relations: ['quarto'],
      });
      expect(result).toEqual(reserva);
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
