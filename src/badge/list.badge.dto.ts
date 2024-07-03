import { ApiProperty } from '@nestjs/swagger';
import { Badge as BadgeModel } from '@prisma/client';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class ListBadgeQuery {
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    description:
      'Número limite de itens por página. O mínimo é 1 e máximo é 20. O padrão é 5.',
    required: false,
    default: 5,
    type: Number,
  })
  limit: number = 5;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    description:
      'Número de páginas. O mínimo e o padrão são 1. Cada página tem `limit` itens.',
    required: false,
    default: 1,
    type: Number,
  })
  page: number = 1;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Filtrar os resultados pelo slug.',
    required: false,
    type: String,
  })
  slug?: string;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    description:
      'Filtrar os resultados pelo nome. O filtro retorna resultados que contêm o valor `name`. Não é case-sensitive.',
    required: false,
    type: String,
  })
  name?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    description: 'Filtrar os resultados pelo ID único.',
    required: false,
    type: Number,
  })
  id?: number;
}

class HelperLinks {
  @ApiProperty({
    required: false,
    description: 'URL para a próxima página de resultados',
  })
  next?: string;

  @ApiProperty({
    required: false,
    description: 'URL para a página anterior de resultados',
  })
  prev?: string;
}

class Badges {
  @ApiProperty({
    required: true,
    description: 'Identificador único do emblema',
  })
  id: number;
  @ApiProperty({
    required: true,
    description: 'Slug do emblema',
  })
  slug: string;
  @ApiProperty({
    required: true,
    description: 'Nome do emblema',
  })
  name: string;
  @ApiProperty({
    required: true,
    description: 'URL da imagem do emblema',
  })
  image: string;
}

export class BadgeList {
  @ApiProperty({ type: HelperLinks })
  _links: HelperLinks;

  @ApiProperty({ description: 'Número de resultados por página' })
  limit: number;

  @ApiProperty({ description: 'Número da página atual' })
  page: number;

  @ApiProperty({
    required: false,
    description: 'O valor utilizado para filtrar por slug',
  })
  slug?: string;

  @ApiProperty({
    required: false,
    description: 'O valor utilizado para filtrar por nome',
  })
  name?: string;

  @ApiProperty({
    required: false,
    description: 'O valor utilizado para filtrar por ID',
  })
  id?: number;

  @ApiProperty({ type: [Badges], description: 'Lista de emblemas' })
  badges: BadgeModel[];
}
