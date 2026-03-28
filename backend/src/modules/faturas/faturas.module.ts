import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Fatura } from './entities/fatura.entity';
import { FaturasController } from './faturas.controller';
import { FaturasService } from './faturas.service';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [TypeOrmModule.forFeature([Fatura]), WebSocketModule],
  controllers: [FaturasController],
  providers: [FaturasService],
  exports: [FaturasService],
})
export class FaturasModule {}
