import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Fatura } from './entities/fatura.entity';
import { CreateFaturaDto } from './dto/create-fatura.dto';
import { UpdateFaturaDto } from './dto/update-fatura.dto';

@Injectable()
export class FaturasService {
  constructor(
    @InjectRepository(Fatura)
    private readonly faturaRepo: Repository<Fatura>,
  ) {}

  async findAll(empresaId: string): Promise<Fatura[]> {
    return this.faturaRepo.find({
      where: { empresaId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(empresaId: string, id: string): Promise<Fatura> {
    const fatura = await this.faturaRepo.findOne({
      where: { id, empresaId },
    });

    if (!fatura) {
      throw new NotFoundException('Fatura nao encontrada');
    }

    return fatura;
  }

  async create(
    empresaId: string,
    dto: CreateFaturaDto,
  ): Promise<Fatura> {
    const fatura = this.faturaRepo.create({
      ...dto,
      empresaId,
    });

    return this.faturaRepo.save(fatura);
  }

  async update(
    empresaId: string,
    id: string,
    dto: UpdateFaturaDto,
  ): Promise<Fatura> {
    const fatura = await this.findOne(empresaId, id);

    Object.assign(fatura, dto);

    return this.faturaRepo.save(fatura);
  }

  async remove(empresaId: string, id: string): Promise<void> {
    const fatura = await this.findOne(empresaId, id);

    await this.faturaRepo.remove(fatura);
  }
}
