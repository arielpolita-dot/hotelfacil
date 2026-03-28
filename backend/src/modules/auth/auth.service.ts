import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Usuario } from '../usuarios/entities/usuario.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { EmpresaUsuario } from '../empresas/entities/empresa-usuario.entity';
import { Permissao } from '../usuarios/entities/permissao.entity';
import { RoleUsuario } from '../../common/enums';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

const BCRYPT_ROUNDS = 12;

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface AuthResult {
  tokens: TokenPair;
  user: { id: string; nome: string; email: string; role: string };
  empresa: { id: string; nome: string };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Empresa)
    private readonly empresaRepo: Repository<Empresa>,
    @InjectRepository(EmpresaUsuario)
    private readonly empresaUsuarioRepo: Repository<EmpresaUsuario>,
    @InjectRepository(Permissao)
    private readonly permissaoRepo: Repository<Permissao>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
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
        role: RoleUsuario.ADMIN,
      });
      await manager.save(usuario);

      const empresa = manager.create(Empresa, {
        nome: dto.nomeEmpresa,
        cnpj: dto.cnpj,
        telefone: dto.telefone,
        endereco: dto.endereco,
        proprietarioId: usuario.id,
      });
      await manager.save(empresa);

      const empresaUsuario = manager.create(EmpresaUsuario, {
        empresaId: empresa.id,
        usuarioId: usuario.id,
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

      const tokens = this.generateTokens(usuario, empresa.id);

      return {
        tokens,
        user: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          role: RoleUsuario.ADMIN,
        },
        empresa: { id: empresa.id, nome: empresa.nome },
      };
    });
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const usuario = await this.usuarioRepo.findOne({
      where: { email: dto.email.toLowerCase() },
      relations: ['empresaUsuarios'],
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciais invalidas');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.senha,
      usuario.senhaHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais invalidas');
    }

    const empresaUsuario = usuario.empresaUsuarios?.[0];
    if (!empresaUsuario) {
      throw new UnauthorizedException(
        'Usuario nao vinculado a nenhuma empresa',
      );
    }

    const empresa = await this.empresaRepo.findOne({
      where: { id: empresaUsuario.empresaId },
    });

    const tokens = this.generateTokens(
      usuario,
      empresaUsuario.empresaId,
    );

    return {
      tokens,
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: empresaUsuario.role,
      },
      empresa: {
        id: empresaUsuario.empresaId,
        nome: empresa?.nome ?? '',
      },
    };
  }

  async refreshToken(token: string): Promise<TokenPair> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Token invalido');
      }

      const usuario = await this.usuarioRepo.findOne({
        where: { id: payload.sub },
      });

      if (!usuario) {
        throw new UnauthorizedException('Usuario nao encontrado');
      }

      return this.generateTokens(usuario, payload.empresaId);
    } catch {
      throw new UnauthorizedException('Refresh token invalido');
    }
  }

  async getMe(userId: string, empresaId: string) {
    const usuario = await this.usuarioRepo.findOne({
      where: { id: userId },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario nao encontrado');
    }

    const empresaUsuario = await this.empresaUsuarioRepo.findOne({
      where: { usuarioId: userId, empresaId },
      relations: ['permissao'],
    });

    const empresa = await this.empresaRepo.findOne({
      where: { id: empresaId },
    });

    return {
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        role: empresaUsuario?.role ?? usuario.role,
      },
      empresa: empresa
        ? { id: empresa.id, nome: empresa.nome }
        : null,
      permissoes: empresaUsuario?.permissao ?? null,
    };
  }

  private generateTokens(
    usuario: Usuario,
    empresaId: string,
  ): TokenPair {
    const accessPayload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      empresaId,
      role: usuario.role,
      type: 'access',
    };

    const refreshPayload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      empresaId,
      role: usuario.role,
      type: 'refresh',
    };

    const accessToken = this.jwtService.sign(accessPayload, {
      expiresIn: this.configService.get('JWT_EXPIRATION', '1h'),
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn: this.configService.get(
        'JWT_REFRESH_EXPIRATION',
        '7d',
      ),
    });

    return { accessToken, refreshToken };
  }
}
