import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Badge, BadgeService } from './badge.service';
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
import { AddUserBadgeResponse, BadgeListBody } from './badge/add.badge.dto';

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
  async setUserBadges(
    @Param() params: UserBadgesParams,
    @Body() body: BadgeListBody[],
  ): Promise<AddUserBadgeResponse> {
    const user_badges = await this.badgeService.findBadgesBySteamId(
      params.steamid,
    );

    if (!user_badges) {
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

    const Badges: Badge[] = [];

    if (ids.length > 0) {
      const foundBadges = await this.badgeService.findBadgesByIds(ids);

      if (foundBadges.length !== ids.length) {
        throw new NotFoundException('Badge not found');
      }

      Badges.push(...foundBadges);
    }

    if (slugs.length > 0) {
      const foundBadges = await this.badgeService.findBadgesBySlugs(slugs);

      if (foundBadges.length !== slugs.length) {
        throw new NotFoundException('Badge not found');
      }

      Badges.push(...foundBadges);
    }

    const repeated_badges: Badge[] = [];

    // NOTE: Isso pode ser muito melhorado, mas por enquanto quero terminar logo isso
    for (const user_badge of user_badges) {
      const found_badge = Badges.find(
        (badge) => badge.id === user_badge.badgeId,
      );
      if (found_badge) {
        repeated_badges.push(found_badge);
        Badges.splice(Badges.indexOf(found_badge), 1);
        continue;
      }
    }

    // We already checked if the user exists
    await this.badgeService.addUserBadges(
      params.steamid,
      Badges.map((b) => b.id),
    );

    return {
      already_had: repeated_badges.map((badge) => ({
        id: badge.id,
        slug: badge.slug,
      })),
    };
  }
}
