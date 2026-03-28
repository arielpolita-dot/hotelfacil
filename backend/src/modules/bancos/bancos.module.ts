import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Banco } from './entities/banco.entity';
import { BancosController } from './bancos.controller';
import { BancosService } from './bancos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Banco])],
  controllers: [BancosController],
  providers: [BancosService],
  exports: [BancosService],
})
export class BancosModule {}
