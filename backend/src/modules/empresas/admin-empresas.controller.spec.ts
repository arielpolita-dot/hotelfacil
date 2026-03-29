import { Test } from '@nestjs/testing';
import { AdminEmpresasController } from './admin-empresas.controller';
import { EmpresasService } from './empresas.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

describe('AdminEmpresasController', () => {
  let controller: AdminEmpresasController;
  let service: Record<string, jest.Mock>;

  beforeEach(async () => {
    service = {
      findAllAdmin: jest.fn().mockResolvedValue([]),
      ativarEmpresa: jest.fn().mockResolvedValue({ id: '1' }),
    };

    const module = await Test.createTestingModule({
      controllers: [AdminEmpresasController],
      providers: [
        { provide: EmpresasService, useValue: service },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(AdminEmpresasController);
  });

  it('findAll delegates to findAllAdmin', async () => {
    await controller.findAll();
    expect(service.findAllAdmin).toHaveBeenCalled();
  });

  it('ativar delegates with id', async () => {
    await controller.ativar('emp-1');
    expect(service.ativarEmpresa).toHaveBeenCalledWith('emp-1');
  });
});
