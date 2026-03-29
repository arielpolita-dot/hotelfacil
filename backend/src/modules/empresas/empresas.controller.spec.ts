import { Test } from '@nestjs/testing';
import { EmpresasController } from './empresas.controller';
import { EmpresasService } from './empresas.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthUser } from '../auth/interfaces/jwt-payload.interface';

describe('EmpresasController', () => {
  let controller: EmpresasController;
  let service: Record<string, jest.Mock>;

  const mockUser: AuthUser = {
    id: 'user-1',
    email: 'admin@hotel.com',
    empresaId: 'emp-1',
    role: 'Admin',
  };

  beforeEach(async () => {
    service = {
      findAllByUser: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({ id: 'emp-1' }),
      findOne: jest.fn().mockResolvedValue({ id: 'emp-1' }),
      update: jest.fn().mockResolvedValue({ id: 'emp-1' }),
      remove: jest.fn().mockResolvedValue(undefined),
      switchCompany: jest.fn().mockResolvedValue({ id: 'emp-1' }),
      findMembers: jest.fn().mockResolvedValue([]),
      addMember: jest.fn().mockResolvedValue({ id: 'm-1' }),
      removeMember: jest.fn().mockResolvedValue(undefined),
    };

    const module = await Test.createTestingModule({
      controllers: [EmpresasController],
      providers: [
        { provide: EmpresasService, useValue: service },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(EmpresasController);
  });

  it('findAll delegates with user.id', async () => {
    await controller.findAll(mockUser);
    expect(service.findAllByUser).toHaveBeenCalledWith('user-1');
  });

  it('create delegates with user.id and dto', async () => {
    const dto = { nome: 'Hotel ABC' } as any;
    await controller.create(dto, mockUser);
    expect(service.create).toHaveBeenCalledWith('user-1', dto);
  });

  it('findOne delegates with id', async () => {
    await controller.findOne('emp-1');
    expect(service.findOne).toHaveBeenCalledWith('emp-1');
  });

  it('update delegates with id, dto and user.id', async () => {
    const dto = { nome: 'Hotel XYZ' } as any;
    await controller.update('emp-1', dto, mockUser);
    expect(service.update).toHaveBeenCalledWith(
      'emp-1',
      dto,
      'user-1',
    );
  });

  it('remove delegates with id and user.id', async () => {
    await controller.remove('emp-1', mockUser);
    expect(service.remove).toHaveBeenCalledWith('emp-1', 'user-1');
  });

  it('switchCompany delegates with id and user.id', async () => {
    await controller.switchCompany('emp-2', mockUser);
    expect(service.switchCompany).toHaveBeenCalledWith(
      'emp-2',
      'user-1',
    );
  });

  it('findMembers delegates with id', async () => {
    await controller.findMembers('emp-1');
    expect(service.findMembers).toHaveBeenCalledWith('emp-1');
  });

  it('addMember delegates with id and dto', async () => {
    const dto = { email: 'new@hotel.com' } as any;
    await controller.addMember('emp-1', dto);
    expect(service.addMember).toHaveBeenCalledWith('emp-1', dto);
  });

  it('removeMember delegates with id and userId', async () => {
    await controller.removeMember('emp-1', 'user-2');
    expect(service.removeMember).toHaveBeenCalledWith(
      'emp-1',
      'user-2',
    );
  });
});
