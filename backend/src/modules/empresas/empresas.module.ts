import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Empresa } from './entities/empresa.entity';
import { EmpresaUsuario } from './entities/empresa-usuario.entity';
import { EmpresasController } from './empresas.controller';
import { AdminEmpresasController } from './admin-empresas.controller';
import { EmpresasService } from './empresas.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Empresa, EmpresaUsuario]),
  ],
  controllers: [EmpresasController, AdminEmpresasController],
  providers: [EmpresasService],
  exports: [EmpresasService],
})
export class EmpresasModule {}
