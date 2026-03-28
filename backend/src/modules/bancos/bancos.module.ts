import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Banco } from './entities/banco.entity';
import { BancosController } from './bancos.controller';
import { BancosService } from './bancos.service';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [TypeOrmModule.forFeature([Banco]), WebSocketModule],
  controllers: [BancosController],
  providers: [BancosService],
  exports: [BancosService],
})
export class BancosModule {}
