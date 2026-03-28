import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateFornecedorDto {
  @ApiProperty({ example: 'Distribuidora XYZ' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nome: string;

  @ApiPropertyOptional({ example: '12.345.678/0001-90' })
  @IsOptional()
  @IsString()
  @MaxLength(18)
  cnpj?: string;

  @ApiPropertyOptional({ example: 'contato@fornecedor.com' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ example: '(11) 99999-0000' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefone?: string;
}
