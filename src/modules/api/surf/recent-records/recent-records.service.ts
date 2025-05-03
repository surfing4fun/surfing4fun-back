import { Injectable } from '@nestjs/common';
import { MeasureRequestDuration } from 'src/decorators/MeasureRequestDuration.decorator';

import { Track } from '../constants/tracks.enum';
import { SurfPrismaService } from '../../../shared/prisma/surf.service';
import { Style } from '../constants/styles.enum';
import { SteamService } from '../../steam/steam.service';

@Injectable()
export class RecentRecordsService {
  constructor(
    private readonly prisma: SurfPrismaService,
    private readonly steamService: SteamService,
  ) {}

  @MeasureRequestDuration()
  async getRecentRecords({
    page = 1,
    pageSize = 10,
  }: {
    page: number;
    pageSize: number;
  }) {
    const skip = (page - 1) * pageSize;

    const records = await this.prisma.$queryRaw<any[]>`
      SELECT
        pt.id,
        pt.auth,
        pt.map,
        pt.time,
        pt.track,
        pt.points,
        pt.date,
        pt.style,
        u.auth as user_auth,
        mt.map_type,
        mt.tier,
        (
          SELECT MIN(pt2.time)
          FROM playertimes pt2
          WHERE pt2.map = pt.map AND pt2.track = pt.track AND pt2.id != pt.id
        ) AS best_time
      FROM playertimes pt
      LEFT JOIN users u ON pt.auth = u.auth
      LEFT JOIN maptiers mt ON pt.map = mt.map
      ORDER BY pt.date DESC
      LIMIT ${pageSize} OFFSET ${skip}
    `;

    const totalResult = await this.prisma.$queryRaw<
      any[]
    >`SELECT COUNT(*) as count FROM playertimes`;
    const total = totalResult[0]?.count || 0;

    const playerSummaries = await Promise.all(
      records.map((record) => this.steamService.getPlayerSummary(record.auth)),
    );

    const data = records.map((record, idx) => {
      let runTimeDifference: number | null = null;
      if (record.best_time !== null && record.best_time !== undefined) {
        runTimeDifference = record.time - record.best_time;
      }
      const playerSummary = playerSummaries[idx];
      return {
        date: record.date,
        map: record.map,
        mapType: record.map_type,
        player: record.user_auth ?? record.auth,
        playerNickname: playerSummary?.nickname ?? null,
        playerProfileUrl: playerSummary?.profileUrl ?? null,
        points: record.points,
        rank: skip + idx + 1,
        runTime: record.time,
        runTimeDifference,
        style: Style[record.style],
        tier: record.tier,
        track: Track[record.track],
      };
    });

    return {
      data,
      page,
      pageSize,
      total: Number(total),
    };
  }
}
