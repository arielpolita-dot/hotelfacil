import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EmpresaUsuario } from '../../modules/empresas/entities/empresa-usuario.entity';
import { RoleUsuario } from '../enums';
import { EMPRESA_ROLES_KEY } from '../decorators/empresa-roles.decorator';

@Injectable()
export class EmpresaGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(EmpresaUsuario)
    private readonly empresaUsuarioRepo: Repository<EmpresaUsuario>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.id) {
      throw new ForbiddenException('Autenticacao necessaria');
    }

    const empresaId = this.extractEmpresaId(request);
    if (!empresaId) {
      return true;
    }

    const membership = await this.empresaUsuarioRepo.findOne({
      where: { empresaId, usuarioId: user.id },
    });

    if (!membership) {
      throw new ForbiddenException(
        'Voce nao e membro desta empresa',
      );
    }

    this.validateRequiredRoles(context, membership.role);

    request.company = {
      id: empresaId,
      role: membership.role,
    };

    return true;
  }

  private extractEmpresaId(request: any): string | undefined {
    return (
      request.params?.empresaId ||
      request.params?.eid
    );
  }

  private validateRequiredRoles(
    context: ExecutionContext,
    role: RoleUsuario,
  ): void {
    const requiredRoles = this.reflector.get<
      RoleUsuario[] | undefined
    >(EMPRESA_ROLES_KEY, context.getHandler());

    if (requiredRoles?.length && !requiredRoles.includes(role)) {
      throw new ForbiddenException(
        'Permissoes insuficientes nesta empresa',
      );
    }
  }
}
