import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import {
  StatusQuarto,
  TipoQuarto,
} from '../../../common/enums';

export class CreateQuartoDto {
  @ApiProperty({ example: 101 })
  @IsInt()
  @Min(1)
  numero: number;

  @ApiProperty({ enum: TipoQuarto, example: TipoQuarto.STANDARD })
  @IsEnum(TipoQuarto)
  tipo: TipoQuarto;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  andar?: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  capacidade: number;

  @ApiProperty({ example: 150.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precoDiaria: number;

  @ApiPropertyOptional({
    enum: StatusQuarto,
    example: StatusQuarto.DISPONIVEL,
  })
  @IsOptional()
  @IsEnum(StatusQuarto)
  status?: StatusQuarto;

  @ApiPropertyOptional({ example: 'Quarto com vista para o mar' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descricao?: string;

  @ApiPropertyOptional({ example: ['TV', 'Ar-condicionado'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  caracteristicas?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imagens?: string[];
}
