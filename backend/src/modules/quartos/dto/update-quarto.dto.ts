import { PartialType } from '@nestjs/swagger';

import { CreateQuartoDto } from './create-quarto.dto';

export class UpdateQuartoDto extends PartialType(CreateQuartoDto) {}
