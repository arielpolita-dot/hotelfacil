import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Banco } from './entities/banco.entity';
import { CreateBancoDto } from './dto/create-banco.dto';
import { UpdateBancoDto } from './dto/update-banco.dto';
import { HotelWebSocketGateway } from '../websocket/websocket.gateway';

const DEFAULT_BANKS = [
  { nome: 'Banco do Brasil', codigo: '001' },
  { nome: 'Bradesco', codigo: '237' },
  { nome: 'Caixa Economica', codigo: '104' },
  { nome: 'Itau Unibanco', codigo: '341' },
  { nome: 'Santander', codigo: '033' },
  { nome: 'Nubank', codigo: '260' },
  { nome: 'Inter', codigo: '077' },
  { nome: 'Sicoob', codigo: '756' },
  { nome: 'PagBank', codigo: '290' },
];

@Injectable()
export class BancosService {
  constructor(
    @InjectRepository(Banco)
    private readonly bancoRepo: Repository<Banco>,
    private readonly wsGateway: HotelWebSocketGateway,
  ) {}

  async findAll(empresaId: string): Promise<Banco[]> {
    return this.bancoRepo.find({
      where: { empresaId },
      order: { nome: 'ASC' },
    });
  }

  async findOne(empresaId: string, id: string): Promise<Banco> {
    const banco = await this.bancoRepo.findOne({
      where: { id, empresaId },
    });

    if (!banco) {
      throw new NotFoundException('Banco nao encontrado');
    }

    return banco;
  }

  async create(
    empresaId: string,
    dto: CreateBancoDto,
  ): Promise<Banco> {
    const banco = this.bancoRepo.create({
      ...dto,
      empresaId,
    });

    const saved = await this.bancoRepo.save(banco);
    this.wsGateway.emitToEmpresa(
      empresaId,
      'bancos:changed',
    );

    return saved;
  }

  async update(
    empresaId: string,
    id: string,
    dto: UpdateBancoDto,
  ): Promise<Banco> {
    const banco = await this.findOne(empresaId, id);

    Object.assign(banco, dto);

    const updated = await this.bancoRepo.save(banco);
    this.wsGateway.emitToEmpresa(
      empresaId,
      'bancos:changed',
    );

    return updated;
  }

  async remove(empresaId: string, id: string): Promise<void> {
    const banco = await this.findOne(empresaId, id);

    await this.bancoRepo.remove(banco);
    this.wsGateway.emitToEmpresa(
      empresaId,
      'bancos:changed',
    );
  }

  async seed(empresaId: string): Promise<Banco[]> {
    const existing = await this.bancoRepo.count({
      where: { empresaId },
    });

    if (existing > 0) {
      return this.findAll(empresaId);
    }

    const bancos = DEFAULT_BANKS.map((bank) =>
      this.bancoRepo.create({ ...bank, empresaId }),
    );

    return this.bancoRepo.save(bancos);
  }
}
