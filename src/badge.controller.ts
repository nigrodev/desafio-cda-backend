import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { BadgeService } from './badge.service';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { BadgeListDto } from './badge/list.badge.dto';

const BADGES_PATH = '/api/badges';

@ApiTags('Emblemas')
@Controller('badges')
export class BadgeController {
  constructor(private readonly badgeService: BadgeService) {}

  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description:
      'Número limite de itens por página. O mínimo é 1 e máximo é 20. O padrão é 5.',
    schema: { default: 5 },
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description:
      'Número de páginas. O mínimo e o padrão são 1. Cada página tem `limit` itens.',
    schema: { default: 1 },
  })
  @ApiQuery({
    name: 'slug',
    required: false,
    type: String,
    description: 'Filtrar os resultados pelo slug.',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description:
      'Filtrar os resultados pelo nome. O filtro retorna resultados que contêm o valor `name`. Não é case-sensitive.',
  })
  @ApiQuery({
    name: 'id',
    required: false,
    type: Number,
    description: 'Filtrar os resultados pelo ID único.',
  })
  @Get('list')
  @ApiOperation({ summary: 'Listar os emblemas' })
  @ApiOkResponse({
    description: 'Lista de emblemas',
    type: BadgeListDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request é retornado quando os parâmetros são inválidos.',
  })
  async getFilteredPosts(
    @Query('limit') limit_req?: string,
    @Query('page') page_req?: string,
    @Query('slug') slug?: string,
    @Query('name') name?: string,
    @Query('id') id_req?: string,
  ): Promise<BadgeListDto> {
    const { limit, page, id } = this.parseQueryParams(
      limit_req,
      page_req,
      id_req,
    );

    const badges = await this.badgeService.badges({
      take: limit,
      skip: limit * (page - 1),
      where: { slug, name: { contains: name }, id },
    });

    const links = this.generatePaginationLinks(limit, page, badges.length);

    return { _links: links, limit, page, slug, name, id, badges };
  }

  private parseQueryParams(
    limit_req?: string,
    page_req?: string,
    id_req?: string,
  ) {
    let limit = limit_req ? parseInt(limit_req) : 5;
    if (isNaN(limit)) {
      throw new BadRequestException('Limit must be a number');
    }
    limit = limit < 1 ? 5 : limit;
    limit = Math.min(limit, 20);

    let page = page_req ? parseInt(page_req) : 1;
    if (isNaN(page)) {
      throw new BadRequestException('Page must be a number');
    }
    page = page < 1 ? 1 : page;

    const id = id_req ? parseInt(id_req) : undefined;

    if (Number.isNaN(id)) {
      throw new BadRequestException('ID must be a number');
    }

    if (id && id < 1) {
      // Achei que setar o ID como "padrão 1" iria ser
      // confuso e indesejado
      throw new BadRequestException('ID must be a positive number');
    }

    return { limit, page, id };
  }

  private generatePaginationLinks(limit: number, page: number, count: number) {
    return {
      next:
        count >= limit
          ? `${BADGES_PATH}/list?limit=${limit}&page=${page + 1}`
          : undefined,
      prev:
        page > 1
          ? `${BADGES_PATH}/list?limit=${limit}&page=${page - 1}`
          : undefined,
    };
  }
}
