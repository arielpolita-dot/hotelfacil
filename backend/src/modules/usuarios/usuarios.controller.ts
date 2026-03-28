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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../auth/interfaces/jwt-payload.interface';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@ApiTags('Usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, EmpresaGuard)
@Controller('empresas/:empresaId/usuarios')
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar usuarios da empresa' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios' })
  findAll(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
  ) {
    return this.usuariosService.findAll(empresaId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuario por ID' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 404, description: 'Nao encontrado' })
  findOne(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.usuariosService.findOne(empresaId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar usuario' })
  @ApiResponse({ status: 201, description: 'Usuario criado' })
  @ApiResponse({ status: 409, description: 'Email ja cadastrado' })
  create(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Body() dto: CreateUsuarioDto,
  ) {
    return this.usuariosService.create(empresaId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar usuario' })
  @ApiResponse({ status: 200, description: 'Usuario atualizado' })
  update(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.update(empresaId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover usuario da empresa' })
  @ApiResponse({ status: 204, description: 'Usuario removido' })
  @ApiResponse({
    status: 400,
    description: 'Nao pode remover a si mesmo',
  })
  remove(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.usuariosService.remove(
      empresaId,
      id,
      user.id,
    );
  }
}
