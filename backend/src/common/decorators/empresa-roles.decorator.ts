import { SetMetadata } from '@nestjs/common';
import { RoleUsuario } from '../enums';

export const EMPRESA_ROLES_KEY = 'empresaRoles';

export const EmpresaRoles = (...roles: RoleUsuario[]) =>
  SetMetadata(EMPRESA_ROLES_KEY, roles);
