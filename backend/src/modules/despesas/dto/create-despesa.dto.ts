import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import {
  CategoriaDespesa,
  StatusDespesa,
} from '../../../common/enums';

export class CreateDespesaDto {
  @ApiProperty({
    enum: CategoriaDespesa,
    example: CategoriaDespesa.MANUTENCAO,
  })
  @IsEnum(CategoriaDespesa)
  categoria: CategoriaDespesa;

  @ApiProperty({ example: 'Conserto do ar-condicionado' })
  @IsString()
  @MaxLength(500)
  descricao: string;

  @ApiProperty({ example: 250.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  valor: number;

  @ApiProperty({ example: '2026-03-28' })
  @IsDateString()
  data: string;

  @ApiPropertyOptional({
    enum: StatusDespesa,
    example: StatusDespesa.PENDENTE,
  })
  @IsOptional()
  @IsEnum(StatusDespesa)
  status?: StatusDespesa;

  @ApiPropertyOptional({ example: 'Tecnico Jose' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fornecedor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observacoes?: string;
}
