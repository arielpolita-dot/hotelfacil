import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FluxoCaixa } from './entities/fluxo-caixa.entity';
import { FluxoCaixaController } from './fluxo-caixa.controller';
import { FluxoCaixaService } from './fluxo-caixa.service';

@Module({
  imports: [TypeOrmModule.forFeature([FluxoCaixa])],
  controllers: [FluxoCaixaController],
  providers: [FluxoCaixaService],
  exports: [FluxoCaixaService],
})
export class FluxoCaixaModule {}
