import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FluxoCaixa } from './entities/fluxo-caixa.entity';
import { CreateFluxoCaixaDto } from './dto/create-fluxo-caixa.dto';
import { HotelWebSocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class FluxoCaixaService {
  constructor(
    @InjectRepository(FluxoCaixa)
    private readonly repo: Repository<FluxoCaixa>,
    private readonly wsGateway: HotelWebSocketGateway,
  ) {}

  async findAll(empresaId: string): Promise<FluxoCaixa[]> {
    return this.repo.find({
      where: { empresaId },
      order: { data: 'DESC', createdAt: 'DESC' },
    });
  }

  async create(
    empresaId: string,
    dto: CreateFluxoCaixaDto,
  ): Promise<FluxoCaixa> {
    const fluxo = this.repo.create({
      ...dto,
      empresaId,
    });

    const saved = await this.repo.save(fluxo);
    this.wsGateway.emitToEmpresa(
      empresaId,
      'fluxoCaixa:changed',
    );

    return saved;
  }
}
