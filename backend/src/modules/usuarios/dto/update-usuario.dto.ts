import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { RoleUsuario, StatusUsuario } from '../../../common/enums';

export class UpdateUsuarioDto {
  @ApiPropertyOptional({ example: 'Maria Silva' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nome?: string;

  @ApiPropertyOptional({ example: 'maria@hotel.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ example: 'novaSenha123' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  senha?: string;

  @ApiPropertyOptional({ example: '(11) 99999-0000' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefone?: string;

  @ApiPropertyOptional({ enum: RoleUsuario })
  @IsOptional()
  @IsEnum(RoleUsuario)
  role?: RoleUsuario;

  @ApiPropertyOptional({ enum: StatusUsuario })
  @IsOptional()
  @IsEnum(StatusUsuario)
  status?: StatusUsuario;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacoes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  dashboard?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  disponibilidade?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  quartos?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  vendas?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  faturas?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  despesas?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  fluxoCaixa?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  usuarios?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  configuracoes?: boolean;
}
