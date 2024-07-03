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
}
export { Badge };
