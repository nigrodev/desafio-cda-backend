import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { BadgeService } from './badge.service';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
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
import { BadgeListBody } from './badge/set.badge.dto';
import { User } from '@prisma/client';

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
    // NOTE: Isso aqui dá pra arrumar 100%. Só nessa endpoint é checada se o usuário existe 2 vezes.
    // Estou com sono e vou deixar assim por enquanto
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

  @ApiBody({
    type: BadgeListBody,
    isArray: true,
    required: true,
    description: 'Lista de emblemas a serem adicionados ao usuário.',
  })
  @Post('user/:steamid')
  @ApiOperation({ summary: 'Adicionar emblemas a um usuário' })
  @ApiCreatedResponse({
    description: 'Emblemas adicionados',
  })
  @ApiNotFoundResponse({
    description: 'Usuário ou emblema não encontrado.',
  })
  async addUserBadges(
    @Param() params: UserBadgesParams,
    @Body() body: BadgeListBody[],
  ) {
    const { user, badges } = await this.FilterBadges(params.steamid, body);

    const user_badges = await this.badgeService
      .findPlayerBadgesByIds(user.id, badges)
      .then((ub) => ub.map((b) => b.badgeId));

    const new_badges = badges.filter((b) => !user_badges.includes(b));

    await this.badgeService.addUserBadges(user.id, new_badges);
  }

  @ApiBody({
    type: BadgeListBody,
    isArray: true,
    required: true,
    description: 'Lista de emblemas a serem removidos do usuário.',
  })
  @Delete('user/:steamid')
  @ApiOperation({ summary: 'Remover emblemas de um usuário' })
  @ApiCreatedResponse({
    description: 'Emblemas removidos',
  })
  @ApiNotFoundResponse({
    description: 'Usuário ou emblema não encontrado.',
  })
  async removeUserBadges(
    @Param() params: UserBadgesParams,
    @Body() body: BadgeListBody[],
  ) {
    const { user, badges } = await this.FilterBadges(params.steamid, body);

    const user_badges = await this.badgeService
      .findPlayerBadgesByIds(user.id, badges)
      .then((ub) => ub.map((b) => b.badgeId));

    // We only remove the badges that the user has
    await this.badgeService.RemoveUserBadges(user.id, user_badges);
  }

  private async FilterBadges(
    steamid: string,
    body: BadgeListBody[],
  ): Promise<{ user: User; badges: number[] }> {
    const user = await this.badgeService.findUserBySteamId(steamid);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const slugs: string[] = [];
    const ids: number[] = [];

    for (const badge of body) {
      if (badge.id) {
        if (typeof badge.id !== 'number') {
          throw new BadRequestException('Each badge id should be a number');
        }
        ids.push(badge.id);
        continue;
      }

      if (badge.slug) {
        if (typeof badge.slug !== 'string') {
          throw new BadRequestException('Each badge slug should be a string');
        }
        slugs.push(badge.slug);
        continue;
      }

      // Se não tem nem id nem slug, é inválido
      throw new BadRequestException(
        'Each badge should have at least id or slug. Your request had neither.',
      );
    }

    const Badges: number[] = [];

    if (ids.length > 0) {
      const foundBadges = await this.badgeService.findBadgesByIds(ids);

      if (foundBadges.length !== ids.length) {
        throw new NotFoundException('Badge not found');
      }

      Badges.push(...foundBadges.map((b) => b.id));
    }

    if (slugs.length > 0) {
      const foundBadges = await this.badgeService.findBadgesBySlugs(slugs);

      if (foundBadges.length !== slugs.length) {
        throw new NotFoundException('Badge not found');
      }

      Badges.push(...foundBadges.map((b) => b.id));
    }

    return { user: user, badges: Badges };
  }
}
