import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
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
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, EmpresaGuard)
@Controller('empresas/:empresaId/dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  @Get('stats')
  @ApiOperation({ summary: 'Estatisticas do dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Estatisticas agregadas',
  })
  getStats(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
  ) {
    return this.dashboardService.getStats(empresaId);
  }
}
