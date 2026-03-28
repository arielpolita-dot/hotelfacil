import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Fornecedor } from './entities/fornecedor.entity';
import { FornecedoresController } from './fornecedores.controller';
import { FornecedoresService } from './fornecedores.service';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [TypeOrmModule.forFeature([Fornecedor]), WebSocketModule],
  controllers: [FornecedoresController],
  providers: [FornecedoresService],
  exports: [FornecedoresService],
})
export class FornecedoresModule {}
