import { Test } from '@nestjs/testing';
import { ReservasController } from './reservas.controller';
import { ReservasService } from './reservas.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EmpresaGuard } from '../../common/guards/empresa.guard';

describe('ReservasController', () => {
  let controller: ReservasController;
  let service: Record<string, jest.Mock>;

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue({ data: [], meta: {} }),
      findOne: jest.fn().mockResolvedValue({ id: '1' }),
      create: jest.fn().mockResolvedValue({ id: '1' }),
      update: jest.fn().mockResolvedValue({ id: '1' }),
      checkout: jest.fn().mockResolvedValue({ id: '1' }),
      cancel: jest.fn().mockResolvedValue({ id: '1' }),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const module = await Test.createTestingModule({
      controllers: [ReservasController],
      providers: [{ provide: ReservasService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(EmpresaGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(ReservasController);
  });

  it('findAll delegates with empresaId and pagination', async () => {
    const pagination = { page: 1, limit: 20 };
    await controller.findAll('emp-1', pagination);
    expect(service.findAll).toHaveBeenCalledWith('emp-1', pagination);
  });

  it('findOne delegates with empresaId and id', async () => {
    await controller.findOne('emp-1', 'r-1');
    expect(service.findOne).toHaveBeenCalledWith('emp-1', 'r-1');
  });

  it('create delegates with empresaId and dto', async () => {
    const dto = { nomeHospede: 'Joao' } as any;
    await controller.create('emp-1', dto);
    expect(service.create).toHaveBeenCalledWith('emp-1', dto);
  });

  it('update delegates with empresaId, id and dto', async () => {
    const dto = { nomeHospede: 'Maria' } as any;
    await controller.update('emp-1', 'r-1', dto);
    expect(service.update).toHaveBeenCalledWith('emp-1', 'r-1', dto);
  });

  it('checkout delegates with empresaId and id', async () => {
    await controller.checkout('emp-1', 'r-1');
    expect(service.checkout).toHaveBeenCalledWith('emp-1', 'r-1');
  });

  it('cancel delegates with empresaId and id', async () => {
    await controller.cancel('emp-1', 'r-1');
    expect(service.cancel).toHaveBeenCalledWith('emp-1', 'r-1');
  });

  it('remove delegates with empresaId and id', async () => {
    await controller.remove('emp-1', 'r-1');
    expect(service.remove).toHaveBeenCalledWith('emp-1', 'r-1');
  });
});
