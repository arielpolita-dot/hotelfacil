import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FluxoCaixa } from './entities/fluxo-caixa.entity';
import { CreateFluxoCaixaDto } from './dto/create-fluxo-caixa.dto';
import {
  PaginationDto,
  PaginatedResult,
} from '../../common/dto/pagination.dto';
import { HotelWebSocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class FluxoCaixaService {
  constructor(
    @InjectRepository(FluxoCaixa)
    private readonly repo: Repository<FluxoCaixa>,
    private readonly wsGateway: HotelWebSocketGateway,
  ) {}

  async findAll(
    empresaId: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResult<FluxoCaixa>> {
    const { page = 1, limit = 20 } = pagination;
    const [data, total] = await this.repo.findAndCount({
      where: { empresaId },
      order: { data: 'DESC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return new PaginatedResult(data, total, page, limit);
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
