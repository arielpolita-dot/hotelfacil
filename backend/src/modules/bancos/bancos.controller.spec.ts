import { Test } from '@nestjs/testing';
import { BancosController } from './bancos.controller';
import { BancosService } from './bancos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EmpresaGuard } from '../../common/guards/empresa.guard';

describe('BancosController', () => {
  let controller: BancosController;
  let service: Record<string, jest.Mock>;

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue({ data: [], meta: {} }),
      findOne: jest.fn().mockResolvedValue({ id: '1' }),
      create: jest.fn().mockResolvedValue({ id: '1' }),
      seed: jest.fn().mockResolvedValue([{ id: '1' }]),
      update: jest.fn().mockResolvedValue({ id: '1' }),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const module = await Test.createTestingModule({
      controllers: [BancosController],
      providers: [{ provide: BancosService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(EmpresaGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(BancosController);
  });

  it('findAll delegates with empresaId and pagination', async () => {
    const pagination = { page: 1, limit: 20 };
    await controller.findAll('emp-1', pagination);
    expect(service.findAll).toHaveBeenCalledWith('emp-1', pagination);
  });

  it('findOne delegates with empresaId and id', async () => {
    await controller.findOne('emp-1', 'b-1');
    expect(service.findOne).toHaveBeenCalledWith('emp-1', 'b-1');
  });

  it('create delegates with empresaId and dto', async () => {
    const dto = { nome: 'Banco do Brasil' } as any;
    await controller.create('emp-1', dto);
    expect(service.create).toHaveBeenCalledWith('emp-1', dto);
  });

  it('seed delegates with empresaId', async () => {
    await controller.seed('emp-1');
    expect(service.seed).toHaveBeenCalledWith('emp-1');
  });

  it('update delegates with empresaId, id and dto', async () => {
    const dto = { nome: 'Itau' } as any;
    await controller.update('emp-1', 'b-1', dto);
    expect(service.update).toHaveBeenCalledWith('emp-1', 'b-1', dto);
  });

  it('remove delegates with empresaId and id', async () => {
    await controller.remove('emp-1', 'b-1');
    expect(service.remove).toHaveBeenCalledWith('emp-1', 'b-1');
  });
});
