import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { AuthUser } from '../../modules/auth/interfaces/jwt-payload.interface';

@Injectable()
export class EmpresaGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthUser;

    const empresaId =
      request.params.empresaId || request.params.eid;

    if (!empresaId) {
      return true;
    }

    if (user.empresaId !== empresaId) {
      throw new ForbiddenException(
        'Acesso negado a esta empresa',
      );
    }

    return true;
  }
}
