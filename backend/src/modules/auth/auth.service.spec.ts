import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { EmpresaUsuario } from '../empresas/entities/empresa-usuario.entity';
import { Permissao } from '../usuarios/entities/permissao.entity';
import { RoleUsuario } from '../../common/enums';

jest.mock('bcrypt');

const mockRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const mockDataSource = {
  transaction: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-token'),
  verify: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string, fallback?: string) => {
    const map: Record<string, string> = {
      JWT_SECRET: 'test-secret',
      JWT_EXPIRATION: '1h',
      JWT_REFRESH_EXPIRATION: '7d',
    };
    return map[key] ?? fallback;
  }),
};

describe('AuthService', () => {
  let service: AuthService;
  let usuarioRepo: ReturnType<typeof mockRepository>;
  let empresaRepo: ReturnType<typeof mockRepository>;
  let empresaUsuarioRepo: ReturnType<typeof mockRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(Usuario), useFactory: mockRepository },
        { provide: getRepositoryToken(Empresa), useFactory: mockRepository },
        { provide: getRepositoryToken(EmpresaUsuario), useFactory: mockRepository },
        { provide: getRepositoryToken(Permissao), useFactory: mockRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usuarioRepo = module.get(getRepositoryToken(Usuario));
    empresaRepo = module.get(getRepositoryToken(Empresa));
    empresaUsuarioRepo = module.get(getRepositoryToken(EmpresaUsuario));
  });

  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    const registerDto = {
      nome: 'Joao Silva',
      email: 'joao@hotel.com',
      senha: 'senhaSegura123',
      nomeEmpresa: 'Hotel Praia',
    };

    it('should throw ConflictException when email exists', async () => {
      usuarioRepo.findOne.mockResolvedValue({ id: '1', email: 'joao@hotel.com' });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create user, empresa, and permissions in transaction', async () => {
      usuarioRepo.findOne.mockResolvedValue(null);

      const mockManager = {
        create: jest.fn().mockImplementation((_entity, data) => ({
          id: 'generated-uuid',
          ...data,
        })),
        save: jest.fn().mockImplementation((entity) => entity),
      };

      mockDataSource.transaction.mockImplementation(
        async (cb: (manager: typeof mockManager) => Promise<unknown>) =>
          cb(mockManager),
      );

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const result = await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('senhaSegura123', 12);
      expect(mockManager.save).toHaveBeenCalledTimes(4);
      expect(result.user.email).toBe('joao@hotel.com');
      expect(result.empresa.nome).toBe('Hotel Praia');
      expect(result.tokens.accessToken).toBe('mock-token');
    });
  });

  describe('login', () => {
    const loginDto = { email: 'joao@hotel.com', senha: 'senhaSegura123' };

    it('should throw UnauthorizedException when user not found', async () => {
      usuarioRepo.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      usuarioRepo.findOne.mockResolvedValue({
        id: '1',
        email: 'joao@hotel.com',
        senhaHash: 'hashed',
        empresaUsuarios: [{ empresaId: 'emp-1', role: RoleUsuario.ADMIN }],
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return tokens and user on valid credentials', async () => {
      const mockUser = {
        id: 'user-1',
        nome: 'Joao',
        email: 'joao@hotel.com',
        senhaHash: 'hashed',
        role: RoleUsuario.ADMIN,
        empresaUsuarios: [
          { empresaId: 'emp-1', role: RoleUsuario.ADMIN },
        ],
      };

      usuarioRepo.findOne.mockResolvedValue(mockUser);
      empresaRepo.findOne.mockResolvedValue({ id: 'emp-1', nome: 'Hotel' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result.tokens.accessToken).toBe('mock-token');
      expect(result.user.id).toBe('user-1');
      expect(result.empresa.id).toBe('emp-1');
    });

    it('should throw when user has no empresa', async () => {
      usuarioRepo.findOne.mockResolvedValue({
        id: '1',
        email: 'joao@hotel.com',
        senhaHash: 'hashed',
        empresaUsuarios: [],
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshToken', () => {
    it('should throw on invalid refresh token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('invalid');
      });

      await expect(service.refreshToken('bad-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw when token type is not refresh', async () => {
      mockJwtService.verify.mockReturnValue({
        sub: '1',
        type: 'access',
        empresaId: 'emp-1',
      });

      await expect(service.refreshToken('access-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return new tokens on valid refresh token', async () => {
      mockJwtService.verify.mockReturnValue({
        sub: 'user-1',
        email: 'joao@hotel.com',
        empresaId: 'emp-1',
        role: RoleUsuario.ADMIN,
        type: 'refresh',
      });

      usuarioRepo.findOne.mockResolvedValue({
        id: 'user-1',
        email: 'joao@hotel.com',
        role: RoleUsuario.ADMIN,
      });

      const result = await service.refreshToken('valid-refresh');

      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
    });
  });

  describe('getMe', () => {
    it('should throw when user not found', async () => {
      usuarioRepo.findOne.mockResolvedValue(null);

      await expect(service.getMe('bad-id', 'emp-1')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return user, empresa, and permissions', async () => {
      usuarioRepo.findOne.mockResolvedValue({
        id: 'user-1',
        nome: 'Joao',
        email: 'joao@hotel.com',
        telefone: null,
        role: RoleUsuario.ADMIN,
      });

      empresaUsuarioRepo.findOne.mockResolvedValue({
        role: RoleUsuario.ADMIN,
        permissao: { dashboard: true },
      });

      empresaRepo.findOne.mockResolvedValue({
        id: 'emp-1',
        nome: 'Hotel',
      });

      const result = await service.getMe('user-1', 'emp-1');

      expect(result.user.id).toBe('user-1');
      expect(result.empresa?.id).toBe('emp-1');
      expect(result.permissoes).toEqual({ dashboard: true });
    });
  });
});
