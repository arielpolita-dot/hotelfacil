import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FluxoCaixa } from './entities/fluxo-caixa.entity';
import { CreateFluxoCaixaDto } from './dto/create-fluxo-caixa.dto';

@Injectable()
export class FluxoCaixaService {
  constructor(
    @InjectRepository(FluxoCaixa)
    private readonly repo: Repository<FluxoCaixa>,
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

    return this.repo.save(fluxo);
  }
}
