import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EmpresaGuard } from '../../common/guards/empresa.guard';
import { FluxoCaixaService } from './fluxo-caixa.service';
import { CreateFluxoCaixaDto } from './dto/create-fluxo-caixa.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('fluxo-caixa')
@Controller('empresas/:empresaId/fluxo-caixa')
@UseGuards(JwtAuthGuard, EmpresaGuard)
export class FluxoCaixaController {
  constructor(private readonly service: FluxoCaixaService) {}

  @Get()
  findAll(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.service.findAll(empresaId, pagination);
  }

  @Post()
  create(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Body() dto: CreateFluxoCaixaDto,
  ) {
    return this.service.create(empresaId, dto);
  }
}
