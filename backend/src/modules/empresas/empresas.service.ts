import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Empresa } from './entities/empresa.entity';
import { EmpresaUsuario } from './entities/empresa-usuario.entity';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { StatusPagamentoEmpresa } from '../../common/enums';

@Injectable()
export class EmpresasService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepo: Repository<Empresa>,
    @InjectRepository(EmpresaUsuario)
    private readonly empresaUsuarioRepo: Repository<EmpresaUsuario>,
  ) {}

  async findAllByUser(userId: string): Promise<Empresa[]> {
    const empresaUsuarios = await this.empresaUsuarioRepo.find({
      where: { usuarioId: userId },
      relations: ['empresa'],
    });

    return empresaUsuarios.map((eu) => eu.empresa);
  }

  async findOne(id: string): Promise<Empresa> {
    const empresa = await this.empresaRepo.findOne({
      where: { id },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa nao encontrada');
    }

    return empresa;
  }

  async update(
    id: string,
    dto: UpdateEmpresaDto,
    userId: string,
  ): Promise<Empresa> {
    const empresa = await this.findOne(id);

    if (empresa.proprietarioId !== userId) {
      throw new ForbiddenException(
        'Apenas o proprietario pode editar a empresa',
      );
    }

    Object.assign(empresa, dto);

    return this.empresaRepo.save(empresa);
  }

  async findAllAdmin(): Promise<Empresa[]> {
    return this.empresaRepo.find({
      relations: ['proprietario'],
      order: { createdAt: 'DESC' },
    });
  }

  async ativarEmpresa(id: string): Promise<Empresa> {
    const empresa = await this.findOne(id);

    empresa.statusPagamento = StatusPagamentoEmpresa.PAGO;
    empresa.dataPagamento = new Date();
    empresa.ativo = true;

    return this.empresaRepo.save(empresa);
  }
}
