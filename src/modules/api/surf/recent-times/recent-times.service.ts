import { Injectable } from '@nestjs/common';
import { MeasureRequestDuration } from 'src/decorators/MeasureRequestDuration.decorator';

import { SurfPrismaService } from '../../../shared/prisma/surf.service';
import { CountryFlagService } from '../../country-flag/country-flag.service';
import { SteamService } from '../../steam/steam.service';
import { Style } from '../constants/styles.enum';
import { Track } from '../constants/tracks.enum';

@Injectable()
export class RecentTimesService {
  constructor(
    private readonly prisma: SurfPrismaService,
    private readonly steamService: SteamService,
    private readonly countryFlagService: CountryFlagService,
  ) {}

  @MeasureRequestDuration()
  async getRecentTimes({
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

    const times = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT
        pt.id,
        pt.auth,
        pt.map,
        pt.time,
        pt.track,
        pt.points,
        pt.date,
        pt.style,
        u.auth as user_auth,
        u.ip as user_ip,
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
      ${whereSQL}
      ORDER BY pt.date DESC
      LIMIT ${pageSize} OFFSET ${skip}`,
    );

    const totalResult = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT COUNT(*) as count FROM playertimes pt ${whereSQL}`,
    );
    const total = totalResult[0]?.count || 0;

    const playerSummaries = await Promise.all(
      times.map((time) =>
        this.steamService.getPlayerSummary(String(time.auth)),
      ),
    );

    const data = await Promise.all(
      times.map(async (time, idx) => {
        let runTimeDifference: number | null = null;
        if (time.best_time !== null && time.best_time !== undefined) {
          runTimeDifference = time.time - time.best_time;
        }

        let playerLocationCountry: string | null = null;
        let playerLocationCountryFlag: string | null = null;
        try {
          playerLocationCountry =
            await this.countryFlagService.getCountryCodeByLongIp(time.user_ip);
          playerLocationCountryFlag =
            await this.countryFlagService.getCountryFlagByCountryCode(
              playerLocationCountry,
            );
        } catch (error) {
          console.error(
            `Error fetching country flag for IP ${time.user_ip}:`,
            error,
          );
        }

        const playerSummary = playerSummaries[idx];
        return {
          date: time.date,
          map: time.map,
          mapType: time.map_type,
          player: time.user_auth ?? time.auth,
          playerNickname: playerSummary?.nickname ?? null,
          playerProfileUrl: playerSummary?.profileUrl ?? null,
          playerAvatar: playerSummary?.avatar ?? null,
          playerLocationCountry,
          playerLocationCountryFlag,
          points: time.points,
          rank: skip + idx + 1,
          runTime: time.time,
          runTimeDifference,
          style: Style[time.style],
          tier: time.tier,
          track: Track[time.track],
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
