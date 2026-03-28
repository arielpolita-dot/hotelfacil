import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

import {
  FormaPagamento,
  StatusReserva,
} from '../../../common/enums';

export class CreateReservaDto {
  @ApiProperty()
  @IsUUID()
  quartoId: string;

  @ApiPropertyOptional({ example: 101 })
  @IsOptional()
  @IsInt()
  @Min(1)
  numeroQuarto?: number;

  @ApiProperty({ example: 'Joao Silva' })
  @IsString()
  @MaxLength(255)
  nomeHospede: string;

  @ApiPropertyOptional({ example: 'joao@email.com' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ example: '11999999999' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefone?: string;

  @ApiPropertyOptional({ example: '12345678901' })
  @IsOptional()
  @IsString()
  @MaxLength(14)
  cpf?: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  adultos: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  criancas?: number;

  @ApiProperty({ example: '2026-04-01T14:00:00Z' })
  @IsDateString()
  dataCheckin: string;

  @ApiProperty({ example: '2026-04-03T12:00:00Z' })
  @IsDateString()
  dataCheckout: string;

  @ApiProperty({ example: 300.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valorTotal: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valorExtra?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  desconto?: number;

  @ApiPropertyOptional({
    enum: FormaPagamento,
    example: FormaPagamento.PIX,
  })
  @IsOptional()
  @IsEnum(FormaPagamento)
  formaPagamento?: FormaPagamento;

  @ApiPropertyOptional({
    enum: StatusReserva,
    example: StatusReserva.CONFIRMADA,
  })
  @IsOptional()
  @IsEnum(StatusReserva)
  status?: StatusReserva;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  bancoId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observacoes?: string;

  @ApiPropertyOptional({ example: '12345678000100' })
  @IsOptional()
  @IsString()
  @MaxLength(18)
  faturadoCnpj?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  faturadoEmpresa?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  faturadoContato?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  faturadoEndereco?: string;
}
