import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import {
  StatusQuarto,
  StatusReserva,
  TipoFluxoCaixa,
} from '../../common/enums';
import { Reserva } from './entities/reserva.entity';
import { Quarto } from '../quartos/entities/quarto.entity';
import { FluxoCaixa } from '../fluxo-caixa/entities/fluxo-caixa.entity';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import {
  PaginationDto,
  PaginatedResult,
} from '../../common/dto/pagination.dto';
import { HotelWebSocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Reserva)
    private readonly repo: Repository<Reserva>,
    private readonly dataSource: DataSource,
    private readonly wsGateway: HotelWebSocketGateway,
  ) {}

  async findAll(
    empresaId: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResult<Reserva>> {
    const { page = 1, limit = 20 } = pagination;
    const [data, total] = await this.repo.findAndCount({
      where: { empresaId },
      relations: ['quarto'],
      order: { dataCheckin: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return new PaginatedResult(data, total, page, limit);
  }

  async findOne(
    empresaId: string,
    id: string,
  ): Promise<Reserva> {
    const reserva = await this.repo.findOne({
      where: { id, empresaId },
      relations: ['quarto'],
    });

    if (!reserva) {
      throw new NotFoundException('Reserva nao encontrada');
    }

    return reserva;
  }

  async create(
    empresaId: string,
    dto: CreateReservaDto,
  ): Promise<Reserva> {
    const result = await this.dataSource.transaction(
      async (manager) => {
        const reserva = manager.create(Reserva, {
          ...dto,
          empresaId,
          status: dto.status ?? StatusReserva.CONFIRMADA,
        });
        const saved = await manager.save(reserva);

        await manager.update(
          Quarto,
          { id: dto.quartoId, empresaId },
          { status: StatusQuarto.OCUPADO },
        );

        const fluxo = manager.create(FluxoCaixa, {
          empresaId,
          tipo: TipoFluxoCaixa.ENTRADA,
          categoria: 'Hospedagem',
          descricao: `Hospedagem - ${dto.nomeHospede}`,
          valor: dto.valorTotal,
          reservaId: saved.id,
          data: dto.dataCheckout
            ? new Date(dto.dataCheckout)
            : new Date(),
        });
        await manager.save(fluxo);

        return saved;
      },
    );

    this.emitReservaEvents(empresaId);

    return result;
  }

  async update(
    empresaId: string,
    id: string,
    dto: UpdateReservaDto,
  ): Promise<Reserva> {
    await this.findOne(empresaId, id);
    await this.repo.update({ id, empresaId }, dto as any);

    const updated = await this.findOne(empresaId, id);
    this.emitReservaEvents(empresaId);

    return updated;
  }

  async checkout(
    empresaId: string,
    id: string,
  ): Promise<Reserva> {
    const reserva = await this.findOne(empresaId, id);

    const result = await this.dataSource.transaction(
      async (manager) => {
        await manager.update(
          Reserva,
          { id, empresaId },
          { status: StatusReserva.CONCLUIDA },
        );

        await manager.update(
          Quarto,
          { id: reserva.quartoId, empresaId },
          { status: StatusQuarto.LIMPEZA },
        );

        return this.findOne(empresaId, id);
      },
    );

    this.emitReservaEvents(empresaId);

    return result;
  }

  async cancel(
    empresaId: string,
    id: string,
  ): Promise<Reserva> {
    const reserva = await this.findOne(empresaId, id);

    const result = await this.dataSource.transaction(
      async (manager) => {
        await manager.update(
          Reserva,
          { id, empresaId },
          { status: StatusReserva.CANCELADA },
        );

        await manager.update(
          Quarto,
          { id: reserva.quartoId, empresaId },
          { status: StatusQuarto.DISPONIVEL },
        );

        return this.findOne(empresaId, id);
      },
    );

    this.emitReservaEvents(empresaId);

    return result;
  }

  async remove(
    empresaId: string,
    id: string,
  ): Promise<void> {
    await this.findOne(empresaId, id);
    await this.repo.delete({ id, empresaId });
    this.emitReservaEvents(empresaId);
  }

  private emitReservaEvents(empresaId: string): void {
    this.wsGateway.emitToEmpresa(
      empresaId,
      'reservas:changed',
    );
    this.wsGateway.emitToEmpresa(
      empresaId,
      'quartos:changed',
    );
    this.wsGateway.emitToEmpresa(
      empresaId,
      'fluxoCaixa:changed',
    );
  }
}
