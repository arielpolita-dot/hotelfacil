import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

import { EmpresasService } from './empresas.service';
import { Empresa } from './entities/empresa.entity';
import { EmpresaUsuario } from './entities/empresa-usuario.entity';
import { AdminUser } from '../auth/entities/admin-user.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Permissao } from '../usuarios/entities/permissao.entity';
import {
  RoleUsuario,
  StatusPagamentoEmpresa,
} from '../../common/enums';

// ─── Mock Factories ───────────────────────────────────

const mockEmpresaRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

const mockEmpresaUsuarioRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

const buildMockManager = () => ({
  create: jest.fn().mockImplementation((_Ent, data) => ({
    id: 'generated-id',
    ...data,
  })),
  save: jest
    .fn()
    .mockImplementation((entity) => ({ ...entity })),
  findOne: jest.fn(),
});

const buildMockDataSource = (
  manager: ReturnType<typeof buildMockManager>,
) => ({
  transaction: jest
    .fn()
    .mockImplementation((cb: any) => cb(manager)),
  getRepository: jest.fn(),
});

const buildEmpresa = (overrides = {}): Partial<Empresa> => ({
  id: 'emp-1',
  nome: 'Hotel Teste',
  cnpj: '12345678000199',
  proprietarioId: 'owner-1',
  ativo: false,
  statusPagamento: StatusPagamentoEmpresa.TRIAL,
  ...overrides,
});

const buildAdminUser = (
  overrides = {},
): Partial<AdminUser> => ({
  id: 'admin-1',
  email: 'admin@test.com',
  name: 'Admin User',
  ...overrides,
});

describe('EmpresasService', () => {
  let service: EmpresasService;
  let empresaRepo: ReturnType<typeof mockEmpresaRepo>;
  let empresaUsuarioRepo: ReturnType<
    typeof mockEmpresaUsuarioRepo
  >;
  let mockManager: ReturnType<typeof buildMockManager>;
  let dataSource: ReturnType<typeof buildMockDataSource>;

  beforeEach(async () => {
    empresaRepo = mockEmpresaRepo();
    empresaUsuarioRepo = mockEmpresaUsuarioRepo();
    mockManager = buildMockManager();
    dataSource = buildMockDataSource(mockManager);

    // Default: getRepository returns mock repos
    const usuarioRepoMock = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((d: any) => d),
      save: jest.fn(),
    };
    const adminUserRepoMock = {
      findOne: jest.fn().mockResolvedValue(null),
    };

    dataSource.getRepository.mockImplementation(
      (entity: any) => {
        if (entity === Usuario || entity?.name === 'Usuario')
          return usuarioRepoMock;
        if (
          entity === AdminUser ||
          entity?.name === 'AdminUser'
        )
          return adminUserRepoMock;
        return { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
      },
    );

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          EmpresasService,
          {
            provide: getRepositoryToken(Empresa),
            useValue: empresaRepo,
          },
          {
            provide: getRepositoryToken(EmpresaUsuario),
            useValue: empresaUsuarioRepo,
          },
          { provide: DataSource, useValue: dataSource },
        ],
      }).compile();

    service = module.get(EmpresasService);
  });

  // ─── create ─────────────────────────────────────────

  describe('create', () => {
    const dto = {
      nome: 'Hotel Novo',
      cnpj: '12345678000199',
      telefone: '11999999999',
      endereco: 'Rua Teste, 123',
    };

    beforeEach(() => {
      // ensureUsuarioExists: Usuario already exists
      const usuarioRepo = {
        findOne: jest.fn().mockResolvedValue({ id: 'owner-1' }),
        create: jest.fn(),
        save: jest.fn(),
      };
      dataSource.getRepository.mockImplementation(
        (entity: any) => {
          if (entity === Usuario || entity?.name === 'Usuario')
            return usuarioRepo;
          return { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
        },
      );
    });

    it('should create empresa with membership and all permissions', async () => {
      await service.create('owner-1', dto as any);

      expect(dataSource.transaction).toHaveBeenCalled();

      // 3 creates: Empresa, EmpresaUsuario, Permissao
      expect(mockManager.create).toHaveBeenCalledTimes(3);
      expect(mockManager.save).toHaveBeenCalledTimes(3);

      // Empresa
      expect(mockManager.create).toHaveBeenNthCalledWith(
        1,
        Empresa,
        expect.objectContaining({
          nome: 'Hotel Novo',
          proprietarioId: 'owner-1',
        }),
      );

      // EmpresaUsuario with ADMIN role
      expect(mockManager.create).toHaveBeenNthCalledWith(
        2,
        EmpresaUsuario,
        expect.objectContaining({
          role: RoleUsuario.ADMIN,
          usuarioId: 'owner-1',
        }),
      );

      // Permissao with all=true
      expect(mockManager.create).toHaveBeenNthCalledWith(
        3,
        Permissao,
        expect.objectContaining({
          dashboard: true,
          disponibilidade: true,
          quartos: true,
          vendas: true,
          faturas: true,
          despesas: true,
          fluxoCaixa: true,
          usuarios: true,
          configuracoes: true,
        }),
      );
    });

    it('should throw NotFoundException when owner not found', async () => {
      const emptyUsuarioRepo = {
        findOne: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
        save: jest.fn(),
      };
      const emptyAdminRepo = {
        findOne: jest.fn().mockResolvedValue(null),
      };
      dataSource.getRepository.mockImplementation(
        (entity: any) => {
          if (entity === Usuario || entity?.name === 'Usuario')
            return emptyUsuarioRepo;
          if (
            entity === AdminUser ||
            entity?.name === 'AdminUser'
          )
            return emptyAdminRepo;
          return { findOne: jest.fn() };
        },
      );

      await expect(
        service.create('ghost-user', dto as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should rollback transaction when save fails', async () => {
      dataSource.transaction.mockRejectedValueOnce(
        new Error('DB error'),
      );

      await expect(
        service.create('owner-1', dto as any),
      ).rejects.toThrow('DB error');
    });
  });

  // ─── findAllByUser ──────────────────────────────────

  describe('findAllByUser', () => {
    it('should return empresas with roles', async () => {
      const emp = buildEmpresa();
      empresaUsuarioRepo.find.mockResolvedValue([
        {
          usuarioId: 'user-1',
          role: RoleUsuario.ADMIN,
          empresa: emp,
        },
      ]);

      const result = await service.findAllByUser('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].role).toBe(RoleUsuario.ADMIN);
      expect(result[0].nome).toBe('Hotel Teste');
    });

    it('should return empty array for unknown user', async () => {
      empresaUsuarioRepo.find.mockResolvedValue([]);

      const result =
        await service.findAllByUser('unknown-user');

      expect(result).toEqual([]);
    });
  });

  // ─── findOne ────────────────────────────────────────

  describe('findOne', () => {
    it('should return empresa when found', async () => {
      empresaRepo.findOne.mockResolvedValue(buildEmpresa());

      const result = await service.findOne('emp-1');

      expect(result.id).toBe('emp-1');
    });

    it('should throw NotFoundException when not found', async () => {
      empresaRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── switchCompany ──────────────────────────────────

  describe('switchCompany', () => {
    it('should return empresa with role when user is member', async () => {
      const emp = buildEmpresa();
      empresaUsuarioRepo.findOne.mockResolvedValue({
        empresaId: 'emp-1',
        usuarioId: 'user-1',
        role: RoleUsuario.GERENTE,
        empresa: emp,
      });

      const result = await service.switchCompany(
        'emp-1',
        'user-1',
      );

      expect(result.id).toBe('emp-1');
      expect(result.role).toBe(RoleUsuario.GERENTE);
    });

    it('should throw ForbiddenException when user is not a member', async () => {
      empresaUsuarioRepo.findOne.mockResolvedValue(null);

      await expect(
        service.switchCompany('emp-1', 'stranger'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── addMember ──────────────────────────────────────

  describe('addMember', () => {
    const dto = { email: 'new@test.com' };

    beforeEach(() => {
      empresaRepo.findOne.mockResolvedValue(buildEmpresa());

      const adminRepoMock = {
        findOne: jest
          .fn()
          .mockResolvedValue(buildAdminUser()),
      };
      const usuarioRepoMock = {
        findOne: jest.fn().mockResolvedValue({ id: 'admin-1' }),
        create: jest.fn().mockImplementation((d: any) => d),
        save: jest.fn(),
      };
      dataSource.getRepository.mockImplementation(
        (entity: any) => {
          if (
            entity === AdminUser ||
            entity?.name === 'AdminUser'
          )
            return adminRepoMock;
          if (entity === Usuario || entity?.name === 'Usuario')
            return usuarioRepoMock;
          return { findOne: jest.fn() };
        },
      );

      empresaUsuarioRepo.findOne.mockResolvedValue(null);
    });

    it('should create membership with default RECEPCIONISTA role', async () => {
      const result = await service.addMember(
        'emp-1',
        dto as any,
      );

      expect(result.role).toBe(RoleUsuario.RECEPCIONISTA);
      expect(mockManager.create).toHaveBeenCalledWith(
        EmpresaUsuario,
        expect.objectContaining({
          role: RoleUsuario.RECEPCIONISTA,
          usuarioId: 'admin-1',
        }),
      );
    });

    it('should create permissions with only dashboard and disponibilidade', async () => {
      await service.addMember('emp-1', dto as any);

      expect(mockManager.create).toHaveBeenCalledWith(
        Permissao,
        expect.objectContaining({
          dashboard: true,
          disponibilidade: true,
        }),
      );

      const permCall = mockManager.create.mock.calls.find(
        (c: any) => c[0] === Permissao,
      );
      expect(permCall[1].quartos).toBeUndefined();
      expect(permCall[1].vendas).toBeUndefined();
    });

    it('should use provided role when specified', async () => {
      await service.addMember('emp-1', {
        ...dto,
        role: RoleUsuario.GERENTE,
      } as any);

      expect(mockManager.create).toHaveBeenCalledWith(
        EmpresaUsuario,
        expect.objectContaining({
          role: RoleUsuario.GERENTE,
        }),
      );
    });

    it('should throw NotFoundException when email not found', async () => {
      dataSource.getRepository.mockImplementation(
        (entity: any) => {
          if (
            entity === AdminUser ||
            entity?.name === 'AdminUser'
          )
            return { findOne: jest.fn().mockResolvedValue(null) };
          if (entity === Usuario || entity?.name === 'Usuario')
            return { findOne: jest.fn().mockResolvedValue(null) };
          return { findOne: jest.fn() };
        },
      );

      await expect(
        service.addMember('emp-1', dto as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when already a member', async () => {
      empresaUsuarioRepo.findOne.mockResolvedValue({
        id: 'eu-1',
      });

      await expect(
        service.addMember('emp-1', dto as any),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when empresa not found', async () => {
      empresaRepo.findOne.mockResolvedValue(null);

      await expect(
        service.addMember('missing-emp', dto as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── removeMember ───────────────────────────────────

  describe('removeMember', () => {
    it('should remove member when valid', async () => {
      empresaUsuarioRepo.findOne.mockResolvedValue({
        empresaId: 'emp-1',
        usuarioId: 'user-2',
      });
      empresaRepo.findOne.mockResolvedValue(
        buildEmpresa({ proprietarioId: 'owner-1' }),
      );

      await service.removeMember('emp-1', 'user-2');

      expect(empresaUsuarioRepo.remove).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when removing owner', async () => {
      empresaUsuarioRepo.findOne.mockResolvedValue({
        empresaId: 'emp-1',
        usuarioId: 'owner-1',
      });
      empresaRepo.findOne.mockResolvedValue(
        buildEmpresa({ proprietarioId: 'owner-1' }),
      );

      await expect(
        service.removeMember('emp-1', 'owner-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when member not found', async () => {
      empresaUsuarioRepo.findOne.mockResolvedValue(null);

      await expect(
        service.removeMember('emp-1', 'ghost'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── update ─────────────────────────────────────────

  describe('update', () => {
    it('should allow owner to update', async () => {
      empresaRepo.findOne.mockResolvedValue(
        buildEmpresa({ proprietarioId: 'owner-1' }),
      );
      empresaRepo.save.mockImplementation((e: any) => e);

      const result = await service.update(
        'emp-1',
        { nome: 'New Name' } as any,
        'owner-1',
      );

      expect(result.nome).toBe('New Name');
    });

    it('should allow admin member to update', async () => {
      empresaRepo.findOne.mockResolvedValue(
        buildEmpresa({ proprietarioId: 'someone-else' }),
      );
      empresaUsuarioRepo.findOne.mockResolvedValue({
        role: RoleUsuario.ADMIN,
      });
      empresaRepo.save.mockImplementation((e: any) => e);

      await expect(
        service.update(
          'emp-1',
          { nome: 'Updated' } as any,
          'admin-user',
        ),
      ).resolves.toBeDefined();
    });

    it('should throw ForbiddenException for non-owner non-admin', async () => {
      empresaRepo.findOne.mockResolvedValue(
        buildEmpresa({ proprietarioId: 'someone-else' }),
      );
      empresaUsuarioRepo.findOne.mockResolvedValue({
        role: RoleUsuario.RECEPCIONISTA,
      });

      await expect(
        service.update(
          'emp-1',
          { nome: 'X' } as any,
          'receptionist',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when user has no membership', async () => {
      empresaRepo.findOne.mockResolvedValue(
        buildEmpresa({ proprietarioId: 'someone-else' }),
      );
      empresaUsuarioRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update(
          'emp-1',
          { nome: 'X' } as any,
          'stranger',
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── remove ─────────────────────────────────────────

  describe('remove', () => {
    it('should allow owner to delete', async () => {
      empresaRepo.findOne.mockResolvedValue(
        buildEmpresa({ proprietarioId: 'owner-1' }),
      );
      empresaRepo.remove.mockResolvedValue(undefined);

      await service.remove('emp-1', 'owner-1');

      expect(empresaRepo.remove).toHaveBeenCalled();
    });

    it('should throw ForbiddenException for non-owner', async () => {
      empresaRepo.findOne.mockResolvedValue(
        buildEmpresa({ proprietarioId: 'owner-1' }),
      );

      await expect(
        service.remove('emp-1', 'not-owner'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── ativarEmpresa ──────────────────────────────────

  describe('ativarEmpresa', () => {
    it('should set pago status, dataPagamento, and ativo=true', async () => {
      const empresa = buildEmpresa();
      empresaRepo.findOne.mockResolvedValue(empresa);
      empresaRepo.save.mockImplementation((e: any) => e);

      const result = await service.ativarEmpresa('emp-1');

      expect(result.statusPagamento).toBe(
        StatusPagamentoEmpresa.PAGO,
      );
      expect(result.dataPagamento).toBeInstanceOf(Date);
      expect(result.ativo).toBe(true);
    });

    it('should throw NotFoundException when empresa not found', async () => {
      empresaRepo.findOne.mockResolvedValue(null);

      await expect(
        service.ativarEmpresa('missing'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
