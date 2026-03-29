import { Test } from '@nestjs/testing';
import { QuartosController } from './quartos.controller';
import { QuartosService } from './quartos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EmpresaGuard } from '../../common/guards/empresa.guard';

describe('QuartosController', () => {
  let controller: QuartosController;
  let service: Record<string, jest.Mock>;

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue({ data: [], meta: {} }),
      findOne: jest.fn().mockResolvedValue({ id: '1' }),
      create: jest.fn().mockResolvedValue({ id: '1' }),
      update: jest.fn().mockResolvedValue({ id: '1' }),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const module = await Test.createTestingModule({
      controllers: [QuartosController],
      providers: [{ provide: QuartosService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(EmpresaGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(QuartosController);
  });

  it('findAll delegates to service with empresaId and pagination', async () => {
    const pagination = { page: 1, limit: 20 };
    await controller.findAll('emp-1', pagination);
    expect(service.findAll).toHaveBeenCalledWith('emp-1', pagination);
  });

  it('findOne delegates to service with empresaId and id', async () => {
    await controller.findOne('emp-1', 'q-1');
    expect(service.findOne).toHaveBeenCalledWith('emp-1', 'q-1');
  });

  it('create delegates to service with empresaId and dto', async () => {
    const dto = { numero: 101, tipo: 'standard' } as any;
    await controller.create('emp-1', dto);
    expect(service.create).toHaveBeenCalledWith('emp-1', dto);
  });

  it('update delegates to service with empresaId, id and dto', async () => {
    const dto = { numero: 102 } as any;
    await controller.update('emp-1', 'q-1', dto);
    expect(service.update).toHaveBeenCalledWith('emp-1', 'q-1', dto);
  });

  it('remove delegates to service with empresaId and id', async () => {
    await controller.remove('emp-1', 'q-1');
    expect(service.remove).toHaveBeenCalledWith('emp-1', 'q-1');
  });
});
