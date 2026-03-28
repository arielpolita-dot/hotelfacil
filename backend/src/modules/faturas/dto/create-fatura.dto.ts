import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import {
  PeriodicidadeFatura,
  StatusFatura,
  TipoContrato,
} from '../../../common/enums';

export class CreateFaturaDto {
  @ApiProperty({ example: 'Hotel ABC Ltda' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  empresaCliente: string;

  @ApiPropertyOptional({ example: '12.345.678/0001-90' })
  @IsOptional()
  @IsString()
  @MaxLength(18)
  cnpj?: string;

  @ApiPropertyOptional({ example: 'Joao Silva' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  contato?: string;

  @ApiPropertyOptional({ example: 'contato@empresa.com' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ example: '(11) 99999-0000' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefone?: string;

  @ApiPropertyOptional({ example: 'Rua das Flores, 123' })
  @IsOptional()
  @IsString()
  endereco?: string;

  @ApiProperty({ enum: TipoContrato, example: TipoContrato.MENSAL })
  @IsEnum(TipoContrato)
  tipoContrato: TipoContrato;

  @ApiProperty({ example: '2025-01-01' })
  @IsDateString()
  dataInicio: string;

  @ApiProperty({ example: '2025-12-31' })
  @IsDateString()
  dataFim: string;

  @ApiProperty({
    enum: PeriodicidadeFatura,
    example: PeriodicidadeFatura.MENSAL,
  })
  @IsEnum(PeriodicidadeFatura)
  periodicidadeFatura: PeriodicidadeFatura;

  @ApiProperty({ example: 1500.0 })
  @IsNumber()
  @Min(0)
  valorMensal: number;

  @ApiPropertyOptional({ example: 18000.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  valorTotal?: number;

  @ApiPropertyOptional({ example: [101, 102, 103] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  quartosInclusos?: number[];

  @ApiPropertyOptional({
    enum: StatusFatura,
    example: StatusFatura.ATIVO,
  })
  @IsOptional()
  @IsEnum(StatusFatura)
  status?: StatusFatura;

  @ApiPropertyOptional({ example: '2025-02-01' })
  @IsOptional()
  @IsDateString()
  proximaFatura?: string;

  @ApiPropertyOptional({ example: 'Contrato renovado' })
  @IsOptional()
  @IsString()
  observacoes?: string;
}
