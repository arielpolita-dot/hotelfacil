import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Empresa } from './entities/empresa.entity';
import { EmpresaUsuario } from './entities/empresa-usuario.entity';
import { Permissao } from '../usuarios/entities/permissao.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { AdminUser } from '../auth/entities/admin-user.entity';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { AddMemberDto } from './dto/add-member.dto';
import {
  RoleUsuario,
  StatusPagamentoEmpresa,
} from '../../common/enums';

@Injectable()
export class EmpresasService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepo: Repository<Empresa>,
    @InjectRepository(EmpresaUsuario)
    private readonly empresaUsuarioRepo: Repository<EmpresaUsuario>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    ownerId: string,
    dto: CreateEmpresaDto,
  ): Promise<Empresa> {
    await this.ensureUsuarioExists(ownerId);

    return this.dataSource.transaction(async (manager) => {
      const empresa = manager.create(Empresa, {
        nome: dto.nome,
        cnpj: dto.cnpj,
        telefone: dto.telefone,
        endereco: dto.endereco,
        proprietarioId: ownerId,
      });
      await manager.save(empresa);

      const empresaUsuario = manager.create(EmpresaUsuario, {
        empresaId: empresa.id,
        usuarioId: ownerId,
        role: RoleUsuario.ADMIN,
      });
      await manager.save(empresaUsuario);

      const permissao = manager.create(Permissao, {
        empresaUsuarioId: empresaUsuario.id,
        dashboard: true,
        disponibilidade: true,
        quartos: true,
        vendas: true,
        faturas: true,
        despesas: true,
        fluxoCaixa: true,
        usuarios: true,
        configuracoes: true,
      });
      await manager.save(permissao);

      return empresa;
    });
  }

  async findAllByUser(
    userId: string,
  ): Promise<Array<Empresa & { role: RoleUsuario }>> {
    const memberships = await this.empresaUsuarioRepo.find({
      where: { usuarioId: userId },
      relations: ['empresa'],
      order: { createdAt: 'ASC' },
    });

    return memberships.map((eu) => ({
      ...eu.empresa,
      role: eu.role,
    }));
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

    await this.assertOwnerOrAdmin(id, userId);

    Object.assign(empresa, dto);

    return this.empresaRepo.save(empresa);
  }

  async remove(id: string, userId: string): Promise<void> {
    const empresa = await this.findOne(id);

    if (empresa.proprietarioId !== userId) {
      throw new ForbiddenException(
        'Apenas o proprietario pode excluir a empresa',
      );
    }

    await this.empresaRepo.remove(empresa);
  }

  async switchCompany(
    empresaId: string,
    userId: string,
  ): Promise<Empresa & { role: RoleUsuario }> {
    const membership = await this.empresaUsuarioRepo.findOne({
      where: { empresaId, usuarioId: userId },
      relations: ['empresa'],
    });

    if (!membership) {
      throw new ForbiddenException(
        'Voce nao e membro desta empresa',
      );
    }

    return {
      ...membership.empresa,
      role: membership.role,
    };
  }

  async findMembers(empresaId: string) {
    await this.findOne(empresaId);

    const members = await this.empresaUsuarioRepo.find({
      where: { empresaId },
      relations: ['usuario'],
      order: { createdAt: 'ASC' },
    });

    return members.map((eu) => ({
      id: eu.usuarioId,
      nome: eu.usuario?.nome,
      email: eu.usuario?.email,
      role: eu.role,
      joinedAt: eu.createdAt,
    }));
  }

  async addMember(empresaId: string, dto: AddMemberDto) {
    await this.findOne(empresaId);

    const adminUser = await this.dataSource
      .getRepository(AdminUser)
      .findOne({ where: { email: dto.email.toLowerCase() } });

    if (!adminUser) {
      throw new NotFoundException(
        'Usuario nao encontrado com este email',
      );
    }

    await this.ensureUsuarioFromAdmin(adminUser);

    const existing = await this.empresaUsuarioRepo.findOne({
      where: { empresaId, usuarioId: adminUser.id },
    });

    if (existing) {
      throw new ConflictException(
        'Usuario ja e membro desta empresa',
      );
    }

    const role = dto.role ?? RoleUsuario.RECEPCIONISTA;

    return this.dataSource.transaction(async (manager) => {
      const empresaUsuario = manager.create(EmpresaUsuario, {
        empresaId,
        usuarioId: adminUser.id,
        role,
      });
      await manager.save(empresaUsuario);

      const permissao = manager.create(Permissao, {
        empresaUsuarioId: empresaUsuario.id,
        dashboard: true,
        disponibilidade: true,
      });
      await manager.save(permissao);

      return {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role,
      };
    });
  }

  async removeMember(
    empresaId: string,
    userId: string,
  ): Promise<void> {
    const membership = await this.empresaUsuarioRepo.findOne({
      where: { empresaId, usuarioId: userId },
    });

    if (!membership) {
      throw new NotFoundException(
        'Membro nao encontrado nesta empresa',
      );
    }

    const empresa = await this.findOne(empresaId);
    if (empresa.proprietarioId === userId) {
      throw new ForbiddenException(
        'Nao e possivel remover o proprietario da empresa',
      );
    }

    await this.empresaUsuarioRepo.remove(membership);
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

  private async ensureUsuarioExists(
    authUserId: string,
  ): Promise<void> {
    const usuarioRepo = this.dataSource.getRepository(Usuario);
    const existing = await usuarioRepo.findOne({
      where: { id: authUserId },
    });

    if (existing) return;

    const adminUser = await this.dataSource
      .getRepository(AdminUser)
      .findOne({ where: { id: authUserId } });

    if (!adminUser) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    await this.createUsuarioFromAdmin(adminUser);
  }

  private async ensureUsuarioFromAdmin(
    adminUser: AdminUser,
  ): Promise<void> {
    const usuarioRepo = this.dataSource.getRepository(Usuario);
    const existing = await usuarioRepo.findOne({
      where: { id: adminUser.id },
    });

    if (!existing) {
      await this.createUsuarioFromAdmin(adminUser);
    }
  }

  private async createUsuarioFromAdmin(
    adminUser: AdminUser,
  ): Promise<void> {
    const usuarioRepo = this.dataSource.getRepository(Usuario);

    const usuario = usuarioRepo.create({
      id: adminUser.id,
      nome: adminUser.name || adminUser.email.split('@')[0],
      email: adminUser.email,
      senhaHash: 'authify-managed',
      role: RoleUsuario.ADMIN,
    });

    await usuarioRepo.save(usuario);
  }

  private async assertOwnerOrAdmin(
    empresaId: string,
    userId: string,
  ): Promise<void> {
    const empresa = await this.findOne(empresaId);

    if (empresa.proprietarioId === userId) return;

    const membership = await this.empresaUsuarioRepo.findOne({
      where: { empresaId, usuarioId: userId },
    });

    if (!membership || membership.role !== RoleUsuario.ADMIN) {
      throw new ForbiddenException(
        'Apenas o proprietario ou admin pode editar',
      );
    }
  }
}
