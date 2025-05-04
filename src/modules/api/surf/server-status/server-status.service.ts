import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { MeasureRequestDuration } from 'src/decorators/MeasureRequestDuration.decorator';

import { SurfPrismaService } from '../../../shared/prisma/surf.service';

@Injectable()
export class ServerStatusService {
  constructor(private readonly prisma: SurfPrismaService) {}

  @MeasureRequestDuration()
  async getServerStatus() {
    try {
      const now = dayjs();
      const twentyFourHoursAgo = now.subtract(24, 'hour');
      const today = now.startOf('day');
      const tomorrow = today.add(1, 'day');

      const [
        playerCount,
        runCount,
        totalPlaytime,
        mapCount,
        runsToday,
        runsLast24Hours,
        jumpStats,
      ] = await Promise.all([
        this.prisma.users.count(),
        this.prisma.playertimes.count(),
        this.prisma.users.aggregate({
          _sum: {
            playtime: true,
          },
        }),
        this.prisma.maptiers.count(),
        this.prisma.playertimes.count({
          where: {
            date: {
              gte: today.unix(),
              lt: tomorrow.unix(),
            },
          },
        }),
        this.prisma.playertimes.count({
          where: {
            date: {
              gte: twentyFourHoursAgo.unix(),
              lt: now.unix(),
            },
          },
        }),
        this.prisma.playertimes.aggregate({
          _sum: {
            jumps: true,
            strafes: true,
          },
        }),
      ]);

      return {
        playerCount,
        runCount,
        totalPlaytime: totalPlaytime._sum.playtime,
        mapCount,
        runsToday,
        runsLast24Hours,
        jumpCount: jumpStats._sum.jumps,
        strafeCount: jumpStats._sum.strafes,
      };
    } catch (error) {
      throw new Error(`Failed to fetch server status: ${error.message}`);
    }
  }
}
