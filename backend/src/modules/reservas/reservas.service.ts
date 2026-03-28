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

@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Reserva)
    private readonly repo: Repository<Reserva>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(empresaId: string): Promise<Reserva[]> {
    return this.repo.find({
      where: { empresaId },
      relations: ['quarto'],
      order: { dataCheckin: 'DESC' },
    });
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
    return this.dataSource.transaction(async (manager) => {
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
    });
  }

  async update(
    empresaId: string,
    id: string,
    dto: UpdateReservaDto,
  ): Promise<Reserva> {
    await this.findOne(empresaId, id);
    await this.repo.update({ id, empresaId }, dto as any);

    return this.findOne(empresaId, id);
  }

  async checkout(
    empresaId: string,
    id: string,
  ): Promise<Reserva> {
    const reserva = await this.findOne(empresaId, id);

    return this.dataSource.transaction(async (manager) => {
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
    });
  }

  async cancel(
    empresaId: string,
    id: string,
  ): Promise<Reserva> {
    const reserva = await this.findOne(empresaId, id);

    return this.dataSource.transaction(async (manager) => {
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
    });
  }

  async remove(
    empresaId: string,
    id: string,
  ): Promise<void> {
    await this.findOne(empresaId, id);
    await this.repo.delete({ id, empresaId });
  }
}
