import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmpresaUsuario } from '../../modules/empresas/entities/empresa-usuario.entity';
import { EmpresaGuard } from './empresa.guard';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([EmpresaUsuario])],
  providers: [EmpresaGuard],
  exports: [EmpresaGuard, TypeOrmModule],
})
export class EmpresaGuardModule {}
