import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateBancoDto {
  @ApiProperty({ example: 'Banco do Brasil' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nome: string;

  @ApiPropertyOptional({ example: '001' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  codigo?: string;

  @ApiPropertyOptional({ example: '1234-5' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  agencia?: string;

  @ApiPropertyOptional({ example: '12345-6' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  conta?: string;
}
