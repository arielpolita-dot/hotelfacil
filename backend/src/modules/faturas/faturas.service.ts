import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Fatura } from './entities/fatura.entity';
import { CreateFaturaDto } from './dto/create-fatura.dto';
import { UpdateFaturaDto } from './dto/update-fatura.dto';
import { HotelWebSocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class FaturasService {
  constructor(
    @InjectRepository(Fatura)
    private readonly faturaRepo: Repository<Fatura>,
    private readonly wsGateway: HotelWebSocketGateway,
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

    const saved = await this.faturaRepo.save(fatura);
    this.wsGateway.emitToEmpresa(
      empresaId,
      'faturas:changed',
    );

    return saved;
  }

  async update(
    empresaId: string,
    id: string,
    dto: UpdateFaturaDto,
  ): Promise<Fatura> {
    const fatura = await this.findOne(empresaId, id);

    Object.assign(fatura, dto);

    const updated = await this.faturaRepo.save(fatura);
    this.wsGateway.emitToEmpresa(
      empresaId,
      'faturas:changed',
    );

    return updated;
  }

  async remove(empresaId: string, id: string): Promise<void> {
    const fatura = await this.findOne(empresaId, id);

    await this.faturaRepo.remove(fatura);
    this.wsGateway.emitToEmpresa(
      empresaId,
      'faturas:changed',
    );
  }
}
