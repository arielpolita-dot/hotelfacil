import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Joao Silva' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nome: string;

  @ApiProperty({ example: 'joao@hotel.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senhaSegura123' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  senha: string;

  @ApiProperty({ example: 'Hotel Praia Bela' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  nomeEmpresa: string;

  @ApiPropertyOptional({ example: '12.345.678/0001-90' })
  @IsOptional()
  @IsString()
  cnpj?: string;

  @ApiPropertyOptional({ example: '(11) 99999-0000' })
  @IsOptional()
  @IsString()
  telefone?: string;

  @ApiPropertyOptional({ example: 'Rua da Praia, 123' })
  @IsOptional()
  @IsString()
  endereco?: string;
}
