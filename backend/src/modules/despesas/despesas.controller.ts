import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EmpresaGuard } from '../../common/guards/empresa.guard';
import { DespesasService } from './despesas.service';
import { CreateDespesaDto } from './dto/create-despesa.dto';
import { UpdateDespesaDto } from './dto/update-despesa.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('despesas')
@Controller('empresas/:empresaId/despesas')
@UseGuards(JwtAuthGuard, EmpresaGuard)
export class DespesasController {
  constructor(private readonly service: DespesasService) {}

  @Get()
  findAll(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.service.findAll(empresaId, pagination);
  }

  @Get(':id')
  findOne(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(empresaId, id);
  }

  @Post()
  create(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Body() dto: CreateDespesaDto,
  ) {
    return this.service.create(empresaId, dto);
  }

  @Put(':id')
  update(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDespesaDto,
  ) {
    return this.service.update(empresaId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.remove(empresaId, id);
  }
}
