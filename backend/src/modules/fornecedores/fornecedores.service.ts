import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Fornecedor } from './entities/fornecedor.entity';
import { CreateFornecedorDto } from './dto/create-fornecedor.dto';
import { UpdateFornecedorDto } from './dto/update-fornecedor.dto';
import {
  PaginationDto,
  PaginatedResult,
} from '../../common/dto/pagination.dto';
import { HotelWebSocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class FornecedoresService {
  constructor(
    @InjectRepository(Fornecedor)
    private readonly fornecedorRepo: Repository<Fornecedor>,
    private readonly wsGateway: HotelWebSocketGateway,
  ) {}

  async findAll(
    empresaId: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResult<Fornecedor>> {
    const { page = 1, limit = 20 } = pagination;
    const [data, total] = await this.fornecedorRepo.findAndCount({
      where: { empresaId },
      order: { nome: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return new PaginatedResult(data, total, page, limit);
  }

  async findOne(
    empresaId: string,
    id: string,
  ): Promise<Fornecedor> {
    const fornecedor = await this.fornecedorRepo.findOne({
      where: { id, empresaId },
    });

    if (!fornecedor) {
      throw new NotFoundException('Fornecedor nao encontrado');
    }

    return fornecedor;
  }

  async create(
    empresaId: string,
    dto: CreateFornecedorDto,
  ): Promise<Fornecedor> {
    const fornecedor = this.fornecedorRepo.create({
      ...dto,
      empresaId,
    });

    const saved = await this.fornecedorRepo.save(fornecedor);
    this.wsGateway.emitToEmpresa(
      empresaId,
      'fornecedores:changed',
    );

    return saved;
  }

  async update(
    empresaId: string,
    id: string,
    dto: UpdateFornecedorDto,
  ): Promise<Fornecedor> {
    const fornecedor = await this.findOne(empresaId, id);

    Object.assign(fornecedor, dto);

    const updated = await this.fornecedorRepo.save(fornecedor);
    this.wsGateway.emitToEmpresa(
      empresaId,
      'fornecedores:changed',
    );

    return updated;
  }

  async remove(empresaId: string, id: string): Promise<void> {
    const fornecedor = await this.findOne(empresaId, id);

    await this.fornecedorRepo.remove(fornecedor);
    this.wsGateway.emitToEmpresa(
      empresaId,
      'fornecedores:changed',
    );
  }
}
