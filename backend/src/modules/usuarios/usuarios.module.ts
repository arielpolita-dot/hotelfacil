import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Usuario } from './entities/usuario.entity';
import { Permissao } from './entities/permissao.entity';
import { EmpresaUsuario } from '../empresas/entities/empresa-usuario.entity';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      EmpresaUsuario,
      Permissao,
    ]),
    WebSocketModule,
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
