import { Test } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EmpresaGuard } from '../../common/guards/empresa.guard';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: Record<string, jest.Mock>;

  beforeEach(async () => {
    service = {
      getStats: jest.fn().mockResolvedValue({
        totalQuartos: 10,
        ocupados: 5,
      }),
    };

    const module = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        { provide: DashboardService, useValue: service },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(EmpresaGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(DashboardController);
  });

  it('getStats delegates with empresaId', async () => {
    await controller.getStats('emp-1');
    expect(service.getStats).toHaveBeenCalledWith('emp-1');
  });

  it('getStats returns service result', async () => {
    const result = await controller.getStats('emp-1');
    expect(result).toEqual({
      totalQuartos: 10,
      ocupados: 5,
    });
  });
});
