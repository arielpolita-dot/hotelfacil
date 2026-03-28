import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { TipoFluxoCaixa } from '../../common/enums';
import { Despesa } from './entities/despesa.entity';
import { FluxoCaixa } from '../fluxo-caixa/entities/fluxo-caixa.entity';
import { CreateDespesaDto } from './dto/create-despesa.dto';
import { UpdateDespesaDto } from './dto/update-despesa.dto';
import { HotelWebSocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class DespesasService {
  constructor(
    @InjectRepository(Despesa)
    private readonly repo: Repository<Despesa>,
    private readonly dataSource: DataSource,
    private readonly wsGateway: HotelWebSocketGateway,
  ) {}

  async findAll(empresaId: string): Promise<Despesa[]> {
    return this.repo.find({
      where: { empresaId },
      order: { data: 'DESC' },
    });
  }

  async findOne(
    empresaId: string,
    id: string,
  ): Promise<Despesa> {
    const despesa = await this.repo.findOne({
      where: { id, empresaId },
    });

    if (!despesa) {
      throw new NotFoundException('Despesa nao encontrada');
    }

    return despesa;
  }

  async create(
    empresaId: string,
    dto: CreateDespesaDto,
  ): Promise<Despesa> {
    const result = await this.dataSource.transaction(
      async (manager) => {
        const despesa = manager.create(Despesa, {
          ...dto,
          empresaId,
        });
        const saved = await manager.save(despesa);

        const fluxo = manager.create(FluxoCaixa, {
          empresaId,
          tipo: TipoFluxoCaixa.SAIDA,
          categoria: dto.categoria,
          descricao: dto.descricao,
          valor: dto.valor,
          despesaId: saved.id,
          data: new Date(dto.data),
        });
        await manager.save(fluxo);

        return saved;
      },
    );

    this.emitDespesaEvents(empresaId);

    return result;
  }

  async update(
    empresaId: string,
    id: string,
    dto: UpdateDespesaDto,
  ): Promise<Despesa> {
    await this.findOne(empresaId, id);
    await this.repo.update({ id, empresaId }, dto as any);

    const updated = await this.findOne(empresaId, id);
    this.emitDespesaEvents(empresaId);

    return updated;
  }

  async remove(
    empresaId: string,
    id: string,
  ): Promise<void> {
    await this.findOne(empresaId, id);
    await this.repo.delete({ id, empresaId });
    this.emitDespesaEvents(empresaId);
  }

  private emitDespesaEvents(empresaId: string): void {
    this.wsGateway.emitToEmpresa(
      empresaId,
      'despesas:changed',
    );
    this.wsGateway.emitToEmpresa(
      empresaId,
      'fluxoCaixa:changed',
    );
  }
}
