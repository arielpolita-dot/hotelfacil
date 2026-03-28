import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../auth/interfaces/jwt-payload.interface';
import { EmpresasService } from './empresas.service';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

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

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes da empresa' })
  @ApiResponse({ status: 200, description: 'Empresa encontrada' })
  @ApiResponse({ status: 404, description: 'Nao encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.empresasService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar empresa (proprietario)' })
  @ApiResponse({ status: 200, description: 'Empresa atualizada' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmpresaDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.empresasService.update(id, dto, user.id);
  }
}
