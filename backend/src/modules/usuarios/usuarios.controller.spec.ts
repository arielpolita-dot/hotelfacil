import { Test } from '@nestjs/testing';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EmpresaGuard } from '../../common/guards/empresa.guard';
import { AuthUser } from '../auth/interfaces/jwt-payload.interface';

describe('UsuariosController', () => {
  let controller: UsuariosController;
  let service: Record<string, jest.Mock>;

  const mockUser: AuthUser = {
    id: 'user-1',
    email: 'admin@hotel.com',
    empresaId: 'emp-1',
    role: 'Admin',
  };

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue({ data: [], meta: {} }),
      findOne: jest.fn().mockResolvedValue({ id: '1' }),
      create: jest.fn().mockResolvedValue({ id: '1' }),
      update: jest.fn().mockResolvedValue({ id: '1' }),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const module = await Test.createTestingModule({
      controllers: [UsuariosController],
      providers: [{ provide: UsuariosService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(EmpresaGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(UsuariosController);
  });

  it('findAll delegates with empresaId and pagination', async () => {
    const pagination = { page: 1, limit: 20 };
    await controller.findAll('emp-1', pagination);
    expect(service.findAll).toHaveBeenCalledWith('emp-1', pagination);
  });

  it('findOne delegates with empresaId and id', async () => {
    await controller.findOne('emp-1', 'u-1');
    expect(service.findOne).toHaveBeenCalledWith('emp-1', 'u-1');
  });

  it('create delegates with empresaId and dto', async () => {
    const dto = { nome: 'Maria', email: 'maria@test.com' } as any;
    await controller.create('emp-1', dto);
    expect(service.create).toHaveBeenCalledWith('emp-1', dto);
  });

  it('update delegates with empresaId, id and dto', async () => {
    const dto = { nome: 'Maria Updated' } as any;
    await controller.update('emp-1', 'u-1', dto);
    expect(service.update).toHaveBeenCalledWith('emp-1', 'u-1', dto);
  });

  it('remove delegates with empresaId, id and currentUser.id', async () => {
    await controller.remove('emp-1', 'u-2', mockUser);
    expect(service.remove).toHaveBeenCalledWith('emp-1', 'u-2', 'user-1');
  });
});
