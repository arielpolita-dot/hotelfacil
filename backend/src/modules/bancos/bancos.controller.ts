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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EmpresaGuard } from '../../common/guards/empresa.guard';
import { BancosService } from './bancos.service';
import { CreateBancoDto } from './dto/create-banco.dto';
import { UpdateBancoDto } from './dto/update-banco.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Bancos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, EmpresaGuard)
@Controller('empresas/:empresaId/bancos')
export class BancosController {
  constructor(private readonly bancosService: BancosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar bancos da empresa' })
  @ApiResponse({ status: 200, description: 'Lista de bancos' })
  findAll(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.bancosService.findAll(empresaId, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar banco por ID' })
  @ApiResponse({ status: 200, description: 'Banco encontrado' })
  @ApiResponse({ status: 404, description: 'Nao encontrado' })
  findOne(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.bancosService.findOne(empresaId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar banco' })
  @ApiResponse({ status: 201, description: 'Banco criado' })
  create(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Body() dto: CreateBancoDto,
  ) {
    return this.bancosService.create(empresaId, dto);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Popular bancos padrao' })
  @ApiResponse({
    status: 201,
    description: 'Bancos padrao criados',
  })
  seed(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
  ) {
    return this.bancosService.seed(empresaId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar banco' })
  @ApiResponse({ status: 200, description: 'Banco atualizado' })
  update(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBancoDto,
  ) {
    return this.bancosService.update(empresaId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover banco' })
  @ApiResponse({ status: 204, description: 'Banco removido' })
  remove(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.bancosService.remove(empresaId, id);
  }
}
