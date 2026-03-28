import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLoggerInterceptor } from './common/interceptors/audit-logger.interceptor';

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
import { WebSocketModule } from './modules/websocket/websocket.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
        synchronize: config.get('NODE_ENV') === 'development',
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),
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
    WebSocketModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: AuditLoggerInterceptor },
  ],
})
export class AppModule {}
