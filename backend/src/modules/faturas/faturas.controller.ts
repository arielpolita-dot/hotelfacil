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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EmpresaGuard } from '../../common/guards/empresa.guard';
import { FaturasService } from './faturas.service';
import { CreateFaturaDto } from './dto/create-fatura.dto';
import { UpdateFaturaDto } from './dto/update-fatura.dto';

@ApiTags('Faturas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, EmpresaGuard)
@Controller('empresas/:empresaId/faturas')
export class FaturasController {
  constructor(private readonly faturasService: FaturasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar faturas da empresa' })
  @ApiResponse({ status: 200, description: 'Lista de faturas' })
  findAll(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
  ) {
    return this.faturasService.findAll(empresaId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar fatura por ID' })
  @ApiResponse({ status: 200, description: 'Fatura encontrada' })
  @ApiResponse({ status: 404, description: 'Nao encontrada' })
  findOne(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.faturasService.findOne(empresaId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar fatura' })
  @ApiResponse({ status: 201, description: 'Fatura criada' })
  create(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Body() dto: CreateFaturaDto,
  ) {
    return this.faturasService.create(empresaId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar fatura' })
  @ApiResponse({ status: 200, description: 'Fatura atualizada' })
  update(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFaturaDto,
  ) {
    return this.faturasService.update(empresaId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover fatura' })
  @ApiResponse({ status: 204, description: 'Fatura removida' })
  remove(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.faturasService.remove(empresaId, id);
  }
}
