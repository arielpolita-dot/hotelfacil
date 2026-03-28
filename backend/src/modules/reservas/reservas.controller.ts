import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EmpresaGuard } from '../../common/guards/empresa.guard';
import { ReservasService } from './reservas.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('reservas')
@Controller('empresas/:empresaId/reservas')
@UseGuards(JwtAuthGuard, EmpresaGuard)
export class ReservasController {
  constructor(private readonly service: ReservasService) {}

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
    @Body() dto: CreateReservaDto,
  ) {
    return this.service.create(empresaId, dto);
  }

  @Put(':id')
  update(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReservaDto,
  ) {
    return this.service.update(empresaId, id, dto);
  }

  @Patch(':id/checkout')
  checkout(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.checkout(empresaId, id);
  }

  @Patch(':id/cancel')
  cancel(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.cancel(empresaId, id);
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
