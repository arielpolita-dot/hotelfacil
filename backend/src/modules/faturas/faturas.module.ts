import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Fatura } from './entities/fatura.entity';
import { FaturasController } from './faturas.controller';
import { FaturasService } from './faturas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Fatura])],
  controllers: [FaturasController],
  providers: [FaturasService],
  exports: [FaturasService],
})
export class FaturasModule {}
