import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';

import { RoleUsuario } from '../../../common/enums';

export class AddMemberDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiPropertyOptional({
    enum: RoleUsuario,
    default: RoleUsuario.RECEPCIONISTA,
  })
  @IsOptional()
  @IsEnum(RoleUsuario)
  role?: RoleUsuario;
}
