import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Fornecedor } from './entities/fornecedor.entity';
import { CreateFornecedorDto } from './dto/create-fornecedor.dto';
import { UpdateFornecedorDto } from './dto/update-fornecedor.dto';

@Injectable()
export class FornecedoresService {
  constructor(
    @InjectRepository(Fornecedor)
    private readonly fornecedorRepo: Repository<Fornecedor>,
  ) {}

  async findAll(empresaId: string): Promise<Fornecedor[]> {
    return this.fornecedorRepo.find({
      where: { empresaId },
      order: { nome: 'ASC' },
    });
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

    return this.fornecedorRepo.save(fornecedor);
  }

  async update(
    empresaId: string,
    id: string,
    dto: UpdateFornecedorDto,
  ): Promise<Fornecedor> {
    const fornecedor = await this.findOne(empresaId, id);

    Object.assign(fornecedor, dto);

    return this.fornecedorRepo.save(fornecedor);
  }

  async remove(empresaId: string, id: string): Promise<void> {
    const fornecedor = await this.findOne(empresaId, id);

    await this.fornecedorRepo.remove(fornecedor);
  }
}
