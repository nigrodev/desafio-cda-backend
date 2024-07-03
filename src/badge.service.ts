import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Badges, Prisma } from '@prisma/client';

@Injectable()
export class BadgeService {
  constructor(private prisma: PrismaService) {}

  async badges(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.BadgesWhereUniqueInput;
    where?: Prisma.BadgesWhereInput;
    orderBy?: Prisma.BadgesOrderByWithRelationInput;
  }): Promise<Badges[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.badges.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }
}
export { Badges };
