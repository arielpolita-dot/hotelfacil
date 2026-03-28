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
import { FornecedoresService } from './fornecedores.service';
import { CreateFornecedorDto } from './dto/create-fornecedor.dto';
import { UpdateFornecedorDto } from './dto/update-fornecedor.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Fornecedores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, EmpresaGuard)
@Controller('empresas/:empresaId/fornecedores')
export class FornecedoresController {
  constructor(
    private readonly fornecedoresService: FornecedoresService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar fornecedores da empresa' })
  @ApiResponse({
    status: 200,
    description: 'Lista de fornecedores',
  })
  findAll(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.fornecedoresService.findAll(empresaId, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar fornecedor por ID' })
  @ApiResponse({
    status: 200,
    description: 'Fornecedor encontrado',
  })
  @ApiResponse({ status: 404, description: 'Nao encontrado' })
  findOne(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.fornecedoresService.findOne(empresaId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar fornecedor' })
  @ApiResponse({ status: 201, description: 'Fornecedor criado' })
  create(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Body() dto: CreateFornecedorDto,
  ) {
    return this.fornecedoresService.create(empresaId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar fornecedor' })
  @ApiResponse({
    status: 200,
    description: 'Fornecedor atualizado',
  })
  update(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFornecedorDto,
  ) {
    return this.fornecedoresService.update(empresaId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover fornecedor' })
  @ApiResponse({
    status: 204,
    description: 'Fornecedor removido',
  })
  remove(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.fornecedoresService.remove(empresaId, id);
  }
}
