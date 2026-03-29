import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { AuditLoggerInterceptor } from './common/interceptors/audit-logger.interceptor';
import { EmpresaGuardModule } from './common/guards/empresa-guard.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmpresasModule } from './modules/empresas/empresas.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { QuartosModule } from './modules/quartos/quartos.module';
import { ReservasModule } from './modules/reservas/reservas.module';
import { FaturasModule } from './modules/faturas/faturas.module';
import { FornecedoresModule } from './modules/fornecedores/fornecedores.module';
import { BancosModule } from './modules/bancos/bancos.module';
import { DespesasModule } from './modules/despesas/despesas.module';
import { FluxoCaixaModule } from './modules/fluxo-caixa/fluxo-caixa.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { HealthModule } from './modules/health/health.module';
import { WebSocketModule } from './modules/websocket/websocket.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 3 },
      { name: 'medium', ttl: 10000, limit: 20 },
      { name: 'long', ttl: 60000, limit: 100 },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DATABASE_HOST'),
        port: config.get<number>('DATABASE_PORT'),
        username: config.get('DATABASE_USER'),
        password: config.get('DATABASE_PASSWORD'),
        database: config.get('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: config.get('NODE_ENV') === 'development' || config.get('DB_SYNCHRONIZE') === 'true',
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),
    EmpresaGuardModule,
    AuthModule,
    EmpresasModule,
    UsuariosModule,
    QuartosModule,
    ReservasModule,
    FaturasModule,
    FornecedoresModule,
    BancosModule,
    DespesasModule,
    FluxoCaixaModule,
    DashboardModule,
    HealthModule,
    WebSocketModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: AuditLoggerInterceptor },
  ],
})
export class AppModule {}
