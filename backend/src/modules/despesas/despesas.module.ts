import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Despesa } from './entities/despesa.entity';
import { DespesasController } from './despesas.controller';
import { DespesasService } from './despesas.service';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [TypeOrmModule.forFeature([Despesa]), WebSocketModule],
  controllers: [DespesasController],
  providers: [DespesasService],
  exports: [DespesasService],
})
export class DespesasModule {}
