import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Badge, Prisma, UserBadge } from '@prisma/client';

@Injectable()
export class BadgeService {
  constructor(private prisma: PrismaService) {}

  async badges(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.BadgeWhereUniqueInput;
    where?: Prisma.BadgeWhereInput;
    orderBy?: Prisma.BadgeOrderByWithRelationInput;
  }): Promise<Badge[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.badge.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async findBadgesBySteamId(steamid: string): Promise<UserBadge[] | null> {
    const user = await this.prisma.user.findUnique({
      where: { steamid },
      include: {
        badges: true,
      },
    });

    if (!user) {
      return null;
    }

    return user.badges;
  }

  async findBadgesByIds(ids: number[]): Promise<Badge[]> {
    return this.prisma.badge.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  async findBadgesBySlugs(ids: string[]): Promise<Badge[]> {
    return this.prisma.badge.findMany({
      where: {
        slug: {
          in: ids,
        },
      },
    });
  }

  async addUserBadges(steamId: string, badgeIds: number[]): Promise<void> {
    // Verificar se o usuário existe
    const userExists = await this.prisma.user.findUnique({
      where: { steamid: steamId },
    });
    if (!userExists) {
      throw new Error('User not found');
    }

    // Provavelmente tem uma forma mais eficiente de fazer isso
    // Já retiramos as duplicatas, então o upsert não deve ser necessário
    await this.prisma.$transaction(
      badgeIds.map((badgeId) =>
        this.prisma.userBadge.upsert({
          where: {
            userId_badgeId: {
              userId: userExists.id,
              badgeId: badgeId,
            },
          },
          update: {},
          create: {
            userId: userExists.id,
            badgeId: badgeId,
          },
        }),
      ),
    );
  }
}
export { Badge };
