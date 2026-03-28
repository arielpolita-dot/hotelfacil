import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface EmpresaContext {
  id: string;
  role: string;
}

export const CurrentEmpresa = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): EmpresaContext => {
    return ctx.switchToHttp().getRequest().company;
  },
);
