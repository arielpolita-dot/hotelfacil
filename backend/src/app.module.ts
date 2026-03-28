import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './modules/auth/auth.module';
import { QuartosModule } from './modules/quartos/quartos.module';
import { ReservasModule } from './modules/reservas/reservas.module';
import { DespesasModule } from './modules/despesas/despesas.module';
import { FluxoCaixaModule } from './modules/fluxo-caixa/fluxo-caixa.module';

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
    QuartosModule,
    ReservasModule,
    DespesasModule,
    FluxoCaixaModule,
  ],
})
export class AppModule {}
