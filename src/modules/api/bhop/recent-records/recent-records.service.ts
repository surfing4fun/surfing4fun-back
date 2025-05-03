import { Injectable } from '@nestjs/common';
import { MeasureRequestDuration } from 'src/decorators/MeasureRequestDuration.decorator';

import { BhopPrismaService } from '../../../shared/prisma/bhop.service';
import { Style } from '../constants/styles.enum';
import { Track } from '../constants/tracks.enum';
import { SteamService } from '../../steam/steam.service';
import { CountryFlagService } from '../../country-flag/country-flag.service';

@Injectable()
export class RecentRecordsService {
  constructor(
    private readonly prisma: BhopPrismaService,
    private readonly steamService: SteamService,
    private readonly countryFlagService: CountryFlagService,
  ) {}

  @MeasureRequestDuration()
  async getRecentRecords({
    page = 1,
    pageSize = 10,
    map,
    style,
    track,
  }: {
    page: number;
    pageSize: number;
    map?: string;
    style?: number;
    track?: number;
  }) {
    const skip = (page - 1) * pageSize;

    const whereClauses = [];
    if (map) whereClauses.push(`pt.map = '${map}'`);
    if (typeof style === 'number') whereClauses.push(`pt.style = ${style}`);
    if (typeof track === 'number') whereClauses.push(`pt.track = ${track}`);
    const whereSQL = whereClauses.length
      ? 'WHERE ' + whereClauses.join(' AND ')
      : '';

    const sql = `
      WITH ranked_times AS (
        SELECT
          pt.id,
          pt.auth,
          pt.map,
          pt.track,
          pt.time,
          pt.points,
          pt.date,
          pt.style,
          u.auth AS user_auth,
          u.ip AS user_ip,
          mt.map_type,
          mt.tier,
          ROW_NUMBER() OVER (PARTITION BY pt.map, pt.track ORDER BY pt.time ASC) AS time_rank
        FROM playertimes pt
        LEFT JOIN users u ON pt.auth = u.auth
        LEFT JOIN maptiers mt ON pt.map = mt.map
        ${whereSQL}
      )
      SELECT
        rt1.*,
        rt2.time AS second_best_time
      FROM ranked_times rt1
      LEFT JOIN ranked_times rt2
        ON rt1.map = rt2.map
        AND rt1.track = rt2.track
        AND rt2.time_rank = 2
      WHERE rt1.time_rank = 1
      ORDER BY rt1.date DESC
      LIMIT ${pageSize} OFFSET ${skip};
    `;

    const records = await this.prisma.$queryRawUnsafe<any[]>(sql);

    const totalResult = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT COUNT(*) as count FROM playertimes pt ${whereSQL}`,
    );
    const total = totalResult[0]?.count || 0;

    const playerSummaries = await Promise.all(
      records.map((record) =>
        this.steamService.getPlayerSummary(String(record.auth)),
      ),
    );

    const data = await Promise.all(
      records.map(async (record, idx) => {
        const runTimeDifference =
          record.second_best_time !== null
            ? record.time - record.second_best_time
            : null;

        let playerLocationCountry: string | null = null;
        let playerLocationCountryFlag: string | null = null;
        try {
          playerLocationCountry =
            await this.countryFlagService.getCountryCodeByLongIp(
              record.user_ip,
            );
          playerLocationCountryFlag =
            await this.countryFlagService.getCountryFlagByCountryCode(
              playerLocationCountry,
            );
        } catch (error) {
          console.error(
            `Error fetching country flag for IP ${record.user_ip}:`,
            error,
          );
        }

        const playerSummary = playerSummaries[idx];
        return {
          date: record.date,
          map: record.map,
          mapType: record.map_type,
          player: record.user_auth ?? record.auth,
          playerNickname: playerSummary?.nickname ?? null,
          playerProfileUrl: playerSummary?.profileUrl ?? null,
          playerAvatar: playerSummary?.avatar ?? null,
          playerLocationCountry,
          playerLocationCountryFlag,
          points: record.points,
          rank: skip + idx + 1,
          runTime: record.time,
          runTimeDifference,
          style: Style[record.style],
          tier: record.tier,
          track: Track[record.track],
        };
      }),
    );

    return {
      data,
      page,
      pageSize,
      total: Number(total),
    };
  }
}
