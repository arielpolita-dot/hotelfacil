import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateEmpresaDto {
  @ApiPropertyOptional({ example: 'Hotel Beira Mar' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nome?: string;

  @ApiPropertyOptional({ example: '12.345.678/0001-90' })
  @IsOptional()
  @IsString()
  @MaxLength(18)
  cnpj?: string;

  @ApiPropertyOptional({ example: '(11) 99999-0000' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefone?: string;

  @ApiPropertyOptional({ example: 'Av. Beira Mar, 1000' })
  @IsOptional()
  @IsString()
  endereco?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logo.png' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 99.9 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  valorMensal?: number;
}
