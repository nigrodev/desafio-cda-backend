import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Badge, Prisma, User, UserBadge } from '@prisma/client';

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

  async findUserBySteamId(steamid: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { steamid },
      include: {
        badges: true,
      },
    });

    if (!user) {
      return null;
    }

    return user;
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

  async findPlayerBadgesByIds(
    userId: number,
    ids: number[],
  ): Promise<UserBadge[]> {
    return this.prisma.userBadge.findMany({
      where: {
        userId: userId,
        badgeId: {
          in: ids,
        },
      },
    });
  }

  async addUserBadges(userId: number, badgeIds: number[]): Promise<void> {
    await this.prisma.$transaction(
      badgeIds.map((badgeId) =>
        this.prisma.userBadge.create({
          data: {
            userId: userId,
            badgeId: badgeId,
          },
        }),
      ),
    );
  }

  async RemoveUserBadges(userId: number, badgeIds: number[]): Promise<void> {
    await this.prisma.$transaction(
      badgeIds.map((badgeId) =>
        this.prisma.userBadge.delete({
          where: {
            userId_badgeId: {
              userId: userId,
              badgeId: badgeId,
            },
          },
        }),
      ),
    );
  }
}
export { Badge };
