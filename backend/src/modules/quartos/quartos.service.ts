import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Quarto } from './entities/quarto.entity';
import { CreateQuartoDto } from './dto/create-quarto.dto';
import { UpdateQuartoDto } from './dto/update-quarto.dto';
import {
  PaginationDto,
  PaginatedResult,
} from '../../common/dto/pagination.dto';
import { HotelWebSocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class QuartosService {
  constructor(
    @InjectRepository(Quarto)
    private readonly repo: Repository<Quarto>,
    private readonly wsGateway: HotelWebSocketGateway,
  ) {}

  async findAll(
    empresaId: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResult<Quarto>> {
    const { page = 1, limit = 20 } = pagination;
    const [data, total] = await this.repo.findAndCount({
      where: { empresaId },
      order: { numero: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return new PaginatedResult(data, total, page, limit);
  }

  async findOne(
    empresaId: string,
    id: string,
  ): Promise<Quarto> {
    const quarto = await this.repo.findOne({
      where: { id, empresaId },
    });

    if (!quarto) {
      throw new NotFoundException('Quarto nao encontrado');
    }

    return quarto;
  }

  async create(
    empresaId: string,
    dto: CreateQuartoDto,
  ): Promise<Quarto> {
    const quarto = this.repo.create({
      ...dto,
      empresaId,
    });

    const saved = await this.repo.save(quarto);
    this.wsGateway.emitToEmpresa(empresaId, 'quartos:changed');

    return saved;
  }

  async update(
    empresaId: string,
    id: string,
    dto: UpdateQuartoDto,
  ): Promise<Quarto> {
    await this.findOne(empresaId, id);
    await this.repo.update({ id, empresaId }, dto);

    const updated = await this.findOne(empresaId, id);
    this.wsGateway.emitToEmpresa(empresaId, 'quartos:changed');

    return updated;
  }

  async remove(
    empresaId: string,
    id: string,
  ): Promise<void> {
    await this.findOne(empresaId, id);
    await this.repo.delete({ id, empresaId });
    this.wsGateway.emitToEmpresa(empresaId, 'quartos:changed');
  }
}
