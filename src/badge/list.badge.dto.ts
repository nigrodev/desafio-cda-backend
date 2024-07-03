import { ApiProperty } from '@nestjs/swagger';
import { Badges as BadgeModel } from '@prisma/client';

class LinksDto {
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

class BadgesDto {
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

export class BadgeListDto {
  @ApiProperty({ type: LinksDto })
  _links: LinksDto;

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

  @ApiProperty({ type: [BadgesDto], description: 'Lista de emblemas' })
  badges: BadgeModel[];
}
