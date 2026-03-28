import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Quarto } from './entities/quarto.entity';
import { CreateQuartoDto } from './dto/create-quarto.dto';
import { UpdateQuartoDto } from './dto/update-quarto.dto';

@Injectable()
export class QuartosService {
  constructor(
    @InjectRepository(Quarto)
    private readonly repo: Repository<Quarto>,
  ) {}

  async findAll(empresaId: string): Promise<Quarto[]> {
    return this.repo.find({
      where: { empresaId },
      order: { numero: 'ASC' },
    });
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

    return this.repo.save(quarto);
  }

  async update(
    empresaId: string,
    id: string,
    dto: UpdateQuartoDto,
  ): Promise<Quarto> {
    await this.findOne(empresaId, id);
    await this.repo.update({ id, empresaId }, dto);

    return this.findOne(empresaId, id);
  }

  async remove(
    empresaId: string,
    id: string,
  ): Promise<void> {
    await this.findOne(empresaId, id);
    await this.repo.delete({ id, empresaId });
  }
}
