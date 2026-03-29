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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../auth/interfaces/jwt-payload.interface';
import { EmpresasService } from './empresas.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { AddMemberDto } from './dto/add-member.dto';

@ApiTags('Empresas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('empresas')
export class EmpresasController {
  constructor(
    private readonly empresasService: EmpresasService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar empresas do usuario' })
  @ApiResponse({ status: 200, description: 'Lista de empresas' })
  findAll(@CurrentUser() user: AuthUser) {
    return this.empresasService.findAllByUser(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar empresa (usuario vira owner)' })
  @ApiResponse({ status: 201, description: 'Empresa criada' })
  create(
    @Body() dto: CreateEmpresaDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.empresasService.create(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes da empresa' })
  @ApiResponse({ status: 200, description: 'Empresa encontrada' })
  @ApiResponse({ status: 404, description: 'Nao encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.empresasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar empresa (owner/admin)' })
  @ApiResponse({ status: 200, description: 'Empresa atualizada' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmpresaDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.empresasService.update(id, dto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir empresa (owner only)' })
  @ApiResponse({ status: 204, description: 'Empresa excluida' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.empresasService.remove(id, user.id);
  }

  @Post(':id/switch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trocar empresa ativa' })
  @ApiResponse({ status: 200, description: 'Empresa ativada' })
  @ApiResponse({ status: 403, description: 'Nao e membro' })
  switchCompany(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.empresasService.switchCompany(id, user.id);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Listar membros da empresa' })
  @ApiResponse({ status: 200, description: 'Lista de membros' })
  findMembers(@Param('id', ParseUUIDPipe) id: string) {
    return this.empresasService.findMembers(id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Adicionar membro a empresa' })
  @ApiResponse({ status: 201, description: 'Membro adicionado' })
  @ApiResponse({ status: 404, description: 'Usuario nao encontrado' })
  @ApiResponse({ status: 409, description: 'Ja e membro' })
  addMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.empresasService.addMember(id, dto);
  }

  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover membro da empresa' })
  @ApiResponse({ status: 204, description: 'Membro removido' })
  @ApiResponse({ status: 403, description: 'Nao pode remover owner' })
  removeMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.empresasService.removeMember(id, userId);
  }
}
