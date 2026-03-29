import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller';
import {
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: Record<string, jest.Mock>;
  let dbIndicator: Record<string, jest.Mock>;

  beforeEach(async () => {
    healthCheckService = {
      check: jest.fn().mockResolvedValue({
        status: 'ok',
        details: { database: { status: 'up' } },
      }),
    };

    dbIndicator = {
      pingCheck: jest.fn().mockResolvedValue({
        database: { status: 'up' },
      }),
    };

    const module = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: healthCheckService,
        },
        {
          provide: TypeOrmHealthIndicator,
          useValue: dbIndicator,
        },
      ],
    }).compile();

    controller = module.get(HealthController);
  });

  it('check calls health.check with db ping', async () => {
    await controller.check();
    expect(healthCheckService.check).toHaveBeenCalled();
  });

  it('live returns ok status with timestamp', () => {
    const result = controller.live();
    expect(result.status).toBe('ok');
    expect(result.timestamp).toBeDefined();
  });

  it('ready calls health.check with db ping', async () => {
    await controller.ready();
    expect(healthCheckService.check).toHaveBeenCalled();
  });
});
