import {
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EmpresaGuard } from '../empresa.guard';
import { RoleUsuario } from '../../enums';
import { EMPRESA_ROLES_KEY } from '../../decorators/empresa-roles.decorator';

const mockEmpresaUsuarioRepo = () => ({
  findOne: jest.fn(),
});

const buildContext = (overrides: {
  user?: any;
  params?: Record<string, string>;
  handler?: any;
}): ExecutionContext => {
  const request = {
    user: overrides.user,
    params: overrides.params ?? {},
    company: undefined as any,
  };

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => overrides.handler ?? (() => {}),
  } as unknown as ExecutionContext;
};

describe('EmpresaGuard', () => {
  let guard: EmpresaGuard;
  let repo: ReturnType<typeof mockEmpresaUsuarioRepo>;
  let reflector: Reflector;

  beforeEach(() => {
    repo = mockEmpresaUsuarioRepo();
    reflector = new Reflector();
    guard = new EmpresaGuard(reflector, repo as any);
  });

  it('should throw ForbiddenException when no user on request', async () => {
    const ctx = buildContext({ user: undefined });

    await expect(guard.canActivate(ctx)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should throw ForbiddenException when user has no id', async () => {
    const ctx = buildContext({ user: { email: 'e@t.com' } });

    await expect(guard.canActivate(ctx)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should return true when no empresaId param exists', async () => {
    const ctx = buildContext({
      user: { id: 'u1' },
      params: {},
    });

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(repo.findOne).not.toHaveBeenCalled();
  });

  it('should set request.company and return true when user is member', async () => {
    repo.findOne.mockResolvedValue({
      empresaId: 'emp-1',
      usuarioId: 'u1',
      role: RoleUsuario.GERENTE,
    });

    const ctx = buildContext({
      user: { id: 'u1' },
      params: { empresaId: 'emp-1' },
    });

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    const req = ctx.switchToHttp().getRequest() as any;
    expect(req.company).toEqual({
      id: 'emp-1',
      role: RoleUsuario.GERENTE,
    });
  });

  it('should accept eid param as empresaId', async () => {
    repo.findOne.mockResolvedValue({
      role: RoleUsuario.ADMIN,
    });

    const ctx = buildContext({
      user: { id: 'u1' },
      params: { eid: 'emp-2' },
    });

    await guard.canActivate(ctx);

    expect(repo.findOne).toHaveBeenCalledWith({
      where: { empresaId: 'emp-2', usuarioId: 'u1' },
    });
  });

  it('should throw ForbiddenException when user is not a member', async () => {
    repo.findOne.mockResolvedValue(null);

    const ctx = buildContext({
      user: { id: 'u1' },
      params: { empresaId: 'emp-1' },
    });

    await expect(guard.canActivate(ctx)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should pass when user role matches required roles', async () => {
    repo.findOne.mockResolvedValue({
      role: RoleUsuario.ADMIN,
    });

    const handler = () => {};
    jest
      .spyOn(reflector, 'get')
      .mockReturnValue([RoleUsuario.ADMIN, RoleUsuario.GERENTE]);

    const ctx = buildContext({
      user: { id: 'u1' },
      params: { empresaId: 'emp-1' },
      handler,
    });

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
  });

  it('should throw ForbiddenException when role does not match required roles', async () => {
    repo.findOne.mockResolvedValue({
      role: RoleUsuario.RECEPCIONISTA,
    });

    const handler = () => {};
    jest
      .spyOn(reflector, 'get')
      .mockReturnValue([RoleUsuario.ADMIN]);

    const ctx = buildContext({
      user: { id: 'u1' },
      params: { empresaId: 'emp-1' },
      handler,
    });

    await expect(guard.canActivate(ctx)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should pass when no required roles are specified', async () => {
    repo.findOne.mockResolvedValue({
      role: RoleUsuario.MANUTENCAO,
    });

    jest.spyOn(reflector, 'get').mockReturnValue(undefined);

    const ctx = buildContext({
      user: { id: 'u1' },
      params: { empresaId: 'emp-1' },
    });

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
  });

  it('should pass when required roles array is empty', async () => {
    repo.findOne.mockResolvedValue({
      role: RoleUsuario.FINANCEIRO,
    });

    jest.spyOn(reflector, 'get').mockReturnValue([]);

    const ctx = buildContext({
      user: { id: 'u1' },
      params: { empresaId: 'emp-1' },
    });

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
  });
});
