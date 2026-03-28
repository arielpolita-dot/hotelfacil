import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Despesa } from './entities/despesa.entity';
import { DespesasController } from './despesas.controller';
import { DespesasService } from './despesas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Despesa])],
  controllers: [DespesasController],
  providers: [DespesasService],
  exports: [DespesasService],
})
export class DespesasModule {}
