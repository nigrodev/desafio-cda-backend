import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class BadgeListBody {
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    description:
      'O ID único do emblema. É necessário pelo menos um dos dois parâmetros.',
    required: false,
    example: 1,
    type: Number,
  })
  id?: number;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description:
      'O slug do emblema. É necessário pelo menos um dos dois parâmetros.',
    required: false,
    type: String,
  })
  slug?: string;
}

export class MinimalBadgeList {
  @ApiProperty({
    required: true,
    description: 'O ID do emblema',
  })
  id: number;
  @ApiProperty({
    required: true,
    description: 'O slug do emblema',
  })
  slug: string;
}
