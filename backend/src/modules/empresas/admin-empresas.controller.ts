import {
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
import { EmpresasService } from './empresas.service';

@ApiTags('Admin - Empresas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/empresas')
export class AdminEmpresasController {
  constructor(
    private readonly empresasService: EmpresasService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as empresas (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todas as empresas',
  })
  findAll() {
    return this.empresasService.findAllAdmin();
  }

  @Put(':id/ativar')
  @ApiOperation({ summary: 'Ativar empresa (admin)' })
  @ApiResponse({ status: 200, description: 'Empresa ativada' })
  @ApiResponse({ status: 404, description: 'Nao encontrada' })
  ativar(@Param('id', ParseUUIDPipe) id: string) {
    return this.empresasService.ativarEmpresa(id);
  }
}
