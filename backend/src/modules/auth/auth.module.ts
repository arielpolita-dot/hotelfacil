import { Module, Global, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthBffService } from './auth.service';
import { AuthBffController } from './auth.controller';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminUser } from './entities/admin-user.entity';
import { AdminSession } from './entities/admin-session.entity';
import { EmpresasModule } from '../empresas/empresas.module';

@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([AdminUser, AdminSession]),
    forwardRef(() => EmpresasModule),
  ],
  controllers: [AuthBffController],
  providers: [AuthBffService, JwtAuthGuard],
  exports: [AuthBffService, JwtAuthGuard],
})
export class AuthModule {}
