import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { RoleUsuario } from '../../../common/enums';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'Maria Silva' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nome: string;

  @ApiProperty({ example: 'maria@hotel.com' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: 'senhaSegura123' })
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  senha: string;

  @ApiPropertyOptional({ example: '(11) 99999-0000' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefone?: string;

  @ApiProperty({ enum: RoleUsuario, example: RoleUsuario.RECEPCIONISTA })
  @IsEnum(RoleUsuario)
  role: RoleUsuario;

  @ApiPropertyOptional({ example: 'Funcionario novo' })
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
