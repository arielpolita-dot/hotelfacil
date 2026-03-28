import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Quarto } from './entities/quarto.entity';
import { QuartosController } from './quartos.controller';
import { QuartosService } from './quartos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Quarto])],
  controllers: [QuartosController],
  providers: [QuartosService],
  exports: [QuartosService],
})
export class QuartosModule {}
