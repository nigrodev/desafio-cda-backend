import { Module } from '@nestjs/common';
import { BadgeController } from './badge.controller';
import { BadgeService } from './badge.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [],
  controllers: [BadgeController],
  providers: [BadgeService, PrismaService],
})
export class BadgeModule {}
