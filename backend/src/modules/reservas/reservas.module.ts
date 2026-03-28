import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Reserva } from './entities/reserva.entity';
import { ReservasController } from './reservas.controller';
import { ReservasService } from './reservas.service';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [TypeOrmModule.forFeature([Reserva]), WebSocketModule],
  controllers: [ReservasController],
  providers: [ReservasService],
  exports: [ReservasService],
})
export class ReservasModule {}
