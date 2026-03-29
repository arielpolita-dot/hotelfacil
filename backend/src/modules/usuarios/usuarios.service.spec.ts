import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const mockUsuarioRepo = {
  findOne: jest.fn(),
};

const mockEmpresaUsuarioRepo = {
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
};

const mockPermissaoRepo = {};

const mockManager = {
  create: jest.fn((_Entity, data) => ({ id: 'generated-id', ...data })),
  save: jest.fn((entity) => Promise.resolve(entity)),
  update: jest.fn(),
};

const mockDataSource = {
  transaction: jest.fn((cb) => cb(mockManager)),
};

const mockWsGateway = {
  emitToEmpresa: jest.fn(),
};

function createService(): UsuariosService {
  return new UsuariosService(
    mockUsuarioRepo as any,
    mockEmpresaUsuarioRepo as any,
    mockPermissaoRepo as any,
    mockDataSource as any,
    mockWsGateway as any,
  );
}

describe('UsuariosService', () => {
  let service: UsuariosService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = createService();
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pw');
  });

  describe('create', () => {
    const empresaId = 'emp-1';
    const dto = {
      nome: 'John',
      email: 'JOHN@EXAMPLE.COM',
      senha: 'secret123',
      role: 'funcionario',
      telefone: '123',
      observacoes: '',
    } as any;

    it('should throw ConflictException if email exists', async () => {
      mockUsuarioRepo.findOne.mockResolvedValue({ id: 'existing' });

      await expect(service.create(empresaId, dto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUsuarioRepo.findOne).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      });
    });

    it('should lowercase email before checking uniqueness', async () => {
      mockUsuarioRepo.findOne.mockResolvedValue(null);

      await service.create(empresaId, dto);

      expect(mockUsuarioRepo.findOne).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      });
    });

    it('should hash password with bcrypt 12 rounds', async () => {
      mockUsuarioRepo.findOne.mockResolvedValue(null);

      await service.create(empresaId, dto);

      expect(bcrypt.hash).toHaveBeenCalledWith('secret123', 12);
    });

    it('should create usuario, empresa_usuario, and permissao in transaction', async () => {
      mockUsuarioRepo.findOne.mockResolvedValue(null);

      await service.create(empresaId, dto);

      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockManager.create).toHaveBeenCalledTimes(3);
      expect(mockManager.save).toHaveBeenCalledTimes(3);
    });

    it('should store email as lowercase in usuario', async () => {
      mockUsuarioRepo.findOne.mockResolvedValue(null);

      await service.create(empresaId, dto);

      const usuarioCreateCall = mockManager.create.mock.calls[0];
      expect(usuarioCreateCall[1].email).toBe('john@example.com');
    });

    it('should set default permissions (dashboard + disponibilidade only)', async () => {
      mockUsuarioRepo.findOne.mockResolvedValue(null);
      const minimalDto = {
        nome: 'Jane',
        email: 'JANE@TEST.COM',
        senha: 'pw',
        role: 'funcionario',
      } as any;

      await service.create(empresaId, minimalDto);

      const permCreateCall = mockManager.create.mock.calls[2];
      const permData = permCreateCall[1];
      expect(permData.dashboard).toBe(true);
      expect(permData.disponibilidade).toBe(true);
      expect(permData.quartos).toBe(false);
      expect(permData.vendas).toBe(false);
      expect(permData.faturas).toBe(false);
      expect(permData.despesas).toBe(false);
      expect(permData.fluxoCaixa).toBe(false);
      expect(permData.usuarios).toBe(false);
      expect(permData.configuracoes).toBe(false);
    });

    it('should emit websocket event after creation', async () => {
      mockUsuarioRepo.findOne.mockResolvedValue(null);

      await service.create(empresaId, dto);

      expect(mockWsGateway.emitToEmpresa).toHaveBeenCalledWith(
        empresaId,
        'usuarios:changed',
      );
    });

    it('should return id, nome, email, and role', async () => {
      mockUsuarioRepo.findOne.mockResolvedValue(null);

      const result = await service.create(empresaId, dto);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('nome');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('role');
    });
  });

  describe('update', () => {
    const empresaId = 'emp-1';
    const userId = 'user-1';
    const euRecord = {
      id: 'eu-1',
      usuario: { id: userId, nome: 'Old' },
      permissao: { id: 'perm-1' },
    };

    beforeEach(() => {
      mockEmpresaUsuarioRepo.findOne.mockResolvedValue(euRecord);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockEmpresaUsuarioRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update(empresaId, userId, { nome: 'New' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should only update provided fields (partial update)', async () => {
      await service.update(empresaId, userId, { nome: 'Updated' } as any);

      const updateCall = mockManager.update.mock.calls[0];
      expect(updateCall[2]).toEqual({ nome: 'Updated' });
    });

    it('should hash password when senha is provided', async () => {
      await service.update(empresaId, userId, { senha: 'new-pw' } as any);

      expect(bcrypt.hash).toHaveBeenCalledWith('new-pw', 12);
      const updateCall = mockManager.update.mock.calls[0];
      expect(updateCall[2]).toHaveProperty('senhaHash', 'hashed-pw');
    });

    it('should update empresa_usuario role when role is provided', async () => {
      await service.update(empresaId, userId, { role: 'gerente' } as any);

      const roleUpdateCall = mockManager.update.mock.calls.find(
        (c) => c[1] === 'eu-1',
      );
      expect(roleUpdateCall).toBeDefined();
      expect(roleUpdateCall[2]).toEqual({ role: 'gerente' });
    });

    it('should update permissao when permission fields provided', async () => {
      await service.update(empresaId, userId, {
        quartos: true,
        vendas: true,
      } as any);

      const permUpdate = mockManager.update.mock.calls.find(
        (c) => c[1] === 'perm-1',
      );
      expect(permUpdate).toBeDefined();
      expect(permUpdate[2]).toEqual({ quartos: true, vendas: true });
    });

    it('should emit websocket event after update', async () => {
      await service.update(empresaId, userId, { nome: 'X' } as any);

      expect(mockWsGateway.emitToEmpresa).toHaveBeenCalledWith(
        empresaId,
        'usuarios:changed',
      );
    });
  });

  describe('remove', () => {
    const empresaId = 'emp-1';

    it('should throw BadRequestException when removing self', async () => {
      await expect(
        service.remove(empresaId, 'user-1', 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockEmpresaUsuarioRepo.findOne.mockResolvedValue(null);

      await expect(
        service.remove(empresaId, 'user-2', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should remove empresa_usuario membership', async () => {
      const eu = { id: 'eu-1' };
      mockEmpresaUsuarioRepo.findOne.mockResolvedValue(eu);

      await service.remove(empresaId, 'user-2', 'user-1');

      expect(mockEmpresaUsuarioRepo.remove).toHaveBeenCalledWith(eu);
      expect(mockWsGateway.emitToEmpresa).toHaveBeenCalledWith(
        empresaId,
        'usuarios:changed',
      );
    });
  });

  describe('findOne', () => {
    it('should return mapped format with permissoes', async () => {
      mockEmpresaUsuarioRepo.findOne.mockResolvedValue({
        usuario: {
          id: 'u1',
          nome: 'John',
          email: 'john@test.com',
          telefone: '123',
          status: 'active',
          observacoes: '',
          createdAt: new Date(),
        },
        role: 'admin',
        permissao: { dashboard: true },
      });

      const result = await service.findOne('emp-1', 'u1');

      expect(result).toHaveProperty('id', 'u1');
      expect(result).toHaveProperty('role', 'admin');
      expect(result).toHaveProperty('permissoes', { dashboard: true });
    });

    it('should throw NotFoundException when not found', async () => {
      mockEmpresaUsuarioRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('emp-1', 'x')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated results ordered by createdAt DESC', async () => {
      mockEmpresaUsuarioRepo.findAndCount.mockResolvedValue([
        [
          {
            usuario: {
              id: 'u1',
              nome: 'A',
              email: 'a@t.com',
              telefone: '',
              status: 'active',
              observacoes: '',
              createdAt: new Date(),
            },
            role: 'admin',
            permissao: {},
          },
        ],
        1,
      ]);

      const result = await service.findAll('emp-1', { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(mockEmpresaUsuarioRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { createdAt: 'DESC' },
          skip: 0,
          take: 10,
        }),
      );
    });
  });
});
