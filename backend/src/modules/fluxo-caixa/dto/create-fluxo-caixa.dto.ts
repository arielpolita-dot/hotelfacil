import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

import { TipoFluxoCaixa } from '../../../common/enums';

export class CreateFluxoCaixaDto {
  @ApiProperty({ enum: TipoFluxoCaixa, example: 'entrada' })
  @IsEnum(TipoFluxoCaixa)
  tipo: TipoFluxoCaixa;

  @ApiProperty({ example: 'Hospedagem' })
  @IsString()
  @MaxLength(50)
  categoria: string;

  @ApiProperty({ example: 'Pagamento de hospedagem' })
  @IsString()
  @MaxLength(500)
  descricao: string;

  @ApiProperty({ example: 350.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  valor: number;

  @ApiProperty({ example: '2026-03-28' })
  @IsDateString()
  data: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  reservaId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  despesaId?: string;

  @ApiPropertyOptional({ example: 'pix' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  metodoPagamento?: string;

  @ApiPropertyOptional({ example: 'confirmado' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string;
}
