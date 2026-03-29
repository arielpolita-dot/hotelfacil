import { Test } from '@nestjs/testing';
import { FluxoCaixaController } from './fluxo-caixa.controller';
import { FluxoCaixaService } from './fluxo-caixa.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EmpresaGuard } from '../../common/guards/empresa.guard';

describe('FluxoCaixaController', () => {
  let controller: FluxoCaixaController;
  let service: Record<string, jest.Mock>;

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue({ data: [], meta: {} }),
      create: jest.fn().mockResolvedValue({ id: '1' }),
    };

    const module = await Test.createTestingModule({
      controllers: [FluxoCaixaController],
      providers: [
        { provide: FluxoCaixaService, useValue: service },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(EmpresaGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(FluxoCaixaController);
  });

  it('findAll delegates with empresaId and pagination', async () => {
    const pagination = { page: 1, limit: 20 };
    await controller.findAll('emp-1', pagination);
    expect(service.findAll).toHaveBeenCalledWith('emp-1', pagination);
  });

  it('create delegates with empresaId and dto', async () => {
    const dto = { tipo: 'entrada', valor: 100 } as any;
    await controller.create('emp-1', dto);
    expect(service.create).toHaveBeenCalledWith('emp-1', dto);
  });
});
