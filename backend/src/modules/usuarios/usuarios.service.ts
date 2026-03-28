import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Usuario } from './entities/usuario.entity';
import { EmpresaUsuario } from '../empresas/entities/empresa-usuario.entity';
import { Permissao } from './entities/permissao.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(EmpresaUsuario)
    private readonly empresaUsuarioRepo: Repository<EmpresaUsuario>,
    @InjectRepository(Permissao)
    private readonly permissaoRepo: Repository<Permissao>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(empresaId: string) {
    const empresaUsuarios = await this.empresaUsuarioRepo.find({
      where: { empresaId },
      relations: ['usuario', 'permissao'],
      order: { createdAt: 'DESC' },
    });

    return empresaUsuarios.map((eu) => ({
      id: eu.usuario.id,
      nome: eu.usuario.nome,
      email: eu.usuario.email,
      telefone: eu.usuario.telefone,
      role: eu.role,
      status: eu.usuario.status,
      observacoes: eu.usuario.observacoes,
      permissoes: eu.permissao,
      createdAt: eu.usuario.createdAt,
    }));
  }

  async findOne(empresaId: string, id: string) {
    const eu = await this.empresaUsuarioRepo.findOne({
      where: { empresaId, usuarioId: id },
      relations: ['usuario', 'permissao'],
    });

    if (!eu) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    return {
      id: eu.usuario.id,
      nome: eu.usuario.nome,
      email: eu.usuario.email,
      telefone: eu.usuario.telefone,
      role: eu.role,
      status: eu.usuario.status,
      observacoes: eu.usuario.observacoes,
      permissoes: eu.permissao,
      createdAt: eu.usuario.createdAt,
    };
  }

  async create(empresaId: string, dto: CreateUsuarioDto) {
    const existing = await this.usuarioRepo.findOne({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('Email ja cadastrado');
    }

    return this.dataSource.transaction(async (manager) => {
      const senhaHash = await bcrypt.hash(dto.senha, BCRYPT_ROUNDS);

      const usuario = manager.create(Usuario, {
        nome: dto.nome,
        email: dto.email.toLowerCase(),
        senhaHash,
        telefone: dto.telefone,
        role: dto.role,
        observacoes: dto.observacoes,
      });
      await manager.save(usuario);

      const empresaUsuario = manager.create(EmpresaUsuario, {
        empresaId,
        usuarioId: usuario.id,
        role: dto.role,
      });
      await manager.save(empresaUsuario);

      const permissao = manager.create(Permissao, {
        empresaUsuarioId: empresaUsuario.id,
        dashboard: dto.dashboard ?? true,
        disponibilidade: dto.disponibilidade ?? true,
        quartos: dto.quartos ?? false,
        vendas: dto.vendas ?? false,
        faturas: dto.faturas ?? false,
        despesas: dto.despesas ?? false,
        fluxoCaixa: dto.fluxoCaixa ?? false,
        usuarios: dto.usuarios ?? false,
        configuracoes: dto.configuracoes ?? false,
      });
      await manager.save(permissao);

      return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: dto.role,
      };
    });
  }

  async update(
    empresaId: string,
    id: string,
    dto: UpdateUsuarioDto,
  ) {
    const eu = await this.empresaUsuarioRepo.findOne({
      where: { empresaId, usuarioId: id },
      relations: ['usuario', 'permissao'],
    });

    if (!eu) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    return this.dataSource.transaction(async (manager) => {
      const updateData: Partial<Usuario> = {};

      if (dto.nome) updateData.nome = dto.nome;
      if (dto.email) updateData.email = dto.email.toLowerCase();
      if (dto.telefone !== undefined) updateData.telefone = dto.telefone;
      if (dto.status) updateData.status = dto.status;
      if (dto.observacoes !== undefined) {
        updateData.observacoes = dto.observacoes;
      }

      if (dto.senha) {
        updateData.senhaHash = await bcrypt.hash(
          dto.senha,
          BCRYPT_ROUNDS,
        );
      }

      if (Object.keys(updateData).length > 0) {
        await manager.update(Usuario, id, updateData);
      }

      if (dto.role) {
        await manager.update(EmpresaUsuario, eu.id, {
          role: dto.role,
        });
      }

      if (eu.permissao) {
        const permUpdate: Partial<Permissao> = {};
        const permFields = [
          'dashboard',
          'disponibilidade',
          'quartos',
          'vendas',
          'faturas',
          'despesas',
          'fluxoCaixa',
          'usuarios',
          'configuracoes',
        ] as const;

        for (const field of permFields) {
          if (dto[field] !== undefined) {
            permUpdate[field] = dto[field];
          }
        }

        if (Object.keys(permUpdate).length > 0) {
          await manager.update(
            Permissao,
            eu.permissao.id,
            permUpdate,
          );
        }
      }

      return this.findOne(empresaId, id);
    });
  }

  async remove(
    empresaId: string,
    id: string,
    currentUserId: string,
  ): Promise<void> {
    if (id === currentUserId) {
      throw new BadRequestException(
        'Voce nao pode remover seu proprio usuario',
      );
    }

    const eu = await this.empresaUsuarioRepo.findOne({
      where: { empresaId, usuarioId: id },
    });

    if (!eu) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    await this.empresaUsuarioRepo.remove(eu);
  }
}
