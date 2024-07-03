import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { BadgeService } from './badge.service';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { BadgeList, ListBadgeQuery } from './badge/list.badge.dto';
import {
  PrettyBadgeList,
  UserBadgeList,
  UserBadgesParams,
} from './badge/user.badges.dto';
import { BadgeListingUtil } from './badge/list.badge.utils';

@ApiTags('Emblemas')
@Controller('badge')
export class BadgeController {
  constructor(private readonly badgeService: BadgeService) {}

  @Get('list')
  @ApiOperation({ summary: 'Listar todos os emblemas disponíveis' })
  @ApiOkResponse({
    description: 'Lista de emblemas',
    type: BadgeList,
  })
  @ApiBadRequestResponse({
    description: 'Os parâmetros são inválidos.',
  })
  async getListOfBadges(@Query() query: ListBadgeQuery): Promise<BadgeList> {
    const badges = await this.badgeService.badges({
      take: query.limit,
      skip: query.limit * (query.page - 1),
      where: {
        slug: query.slug,
        name: { contains: query.name },
        id: query.id,
      },
    });

    const links = BadgeListingUtil.generatePaginationLinks(
      query.limit,
      query.page,
      badges.length,
    );

    return {
      _links: links,
      limit: query.limit,
      page: query.page,
      slug: query.slug,
      name: query.name,
      id: query.id,
      badges,
    };
  }

  @Get('user/:steamid')
  @ApiOperation({ summary: 'Listar os emblemas de um usuário' })
  @ApiOkResponse({
    description: 'Lista de emblemas do usuário',
    type: UserBadgeList,
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado.',
  })
  async getUserBadges(
    @Param() params: UserBadgesParams,
  ): Promise<UserBadgeList> {
    const badges = await this.badgeService.findBadgesBySteamId(params.steamid);

    if (!badges) {
      throw new NotFoundException('User not found.');
    }

    if (badges.length === 0) {
      return {
        steamid: params.steamid,
        badges: [],
      };
    }

    const pretty_badges: PrettyBadgeList[] =
      await this.badgeService.findBadgesByIds(
        badges.map((badge) => badge.badgeId),
      );

    // Add o acquiredAt para ficar bonitinho
    pretty_badges.forEach((badge) => {
      const userBadge = badges.find((ub) => ub.badgeId === badge.id);
      badge.acquiredAt = userBadge?.acquiredAt;
    });

    return {
      steamid: params.steamid,
      badges: pretty_badges,
    };
  }
}
