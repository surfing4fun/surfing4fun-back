import { Injectable } from '@nestjs/common';
import {
  IPrismaQueryable,
  PaginatorService,
} from 'src/modules/helpers/services/paginator.service';

import { BhopRecentTimeDto } from './dto/recent-time.dto';
import { BhopRecentTimesQueryDto } from './dto/recent-times-query.dto';
import { BhopRecentTimesResponseDto } from './dto/recent-times-response.dto';

import { BhopPrismaService } from '../../../shared/prisma/bhop.service';
import { CountryFlagService } from '../../country-flag/country-flag.service';
import { SteamService } from '../../steam/steam.service';
import { Style } from '../constants/styles.enum';
import { Track } from '../constants/tracks.enum';

@Injectable()
export class RecentTimesService {
  constructor(
    private readonly prisma: BhopPrismaService,
    private readonly steamService: SteamService,
    private readonly countryFlagService: CountryFlagService,
    private readonly paginator: PaginatorService,
  ) {}

  async getRecentTimes(
    query: BhopRecentTimesQueryDto,
  ): Promise<BhopRecentTimesResponseDto> {
    const { page, pageSize, map, style, track } = query;
    const pageNum = Math.max(1, Number(page));
    const pageSizeNum = Math.max(1, Number(pageSize));

    const clauses: string[] = [];
    if (map) clauses.push(`pt.map = '${map}'`);
    if (typeof style === 'number') clauses.push(`pt.style = ${style}`);
    if (typeof track === 'number') clauses.push(`pt.track = ${track}`);
    const whereSql = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const baseQuery = `
      SELECT
        pt.id,
        pt.auth,
        pt.map,
        pt.time,
        pt.track,
        pt.points,
        pt.date,
        pt.style,
        u.auth AS user_auth,
        u.ip   AS user_ip,
        mt.map_type,
        mt.tier,
        (
          SELECT MIN(pt2.time)
          FROM playertimes pt2
          WHERE pt2.map = pt.map
            AND pt2.track = pt.track
            AND pt2.id != pt.id
        ) AS best_time
      FROM playertimes pt
      LEFT JOIN users u     ON pt.auth = u.auth
      LEFT JOIN maptiers mt ON pt.map = mt.map
      ${whereSql}
      ORDER BY pt.date DESC
    `;

    const paged = await this.paginator.paginateSqlAutoCount<any>(
      this.prisma as unknown as IPrismaQueryable,
      baseQuery,
      'playertimes pt',
      whereSql,
      pageNum,
      pageSizeNum,
      (p) => `/recent-times?page=${p}&pageSize=${pageSizeNum}`,
    );

    const summaries = await Promise.all(
      paged.data.map((t) => this.steamService.getPlayerSummary(String(t.auth))),
    );

    const data: BhopRecentTimeDto[] = await Promise.all(
      paged.data.map(async (time, i) => {
        const runTimeDiff =
          time.best_time != null ? time.time - time.best_time : null;

        let country: string | null = null;
        let flag: string | null = null;
        try {
          country = await this.countryFlagService.getCountryCodeByLongIp(
            time.user_ip,
          );
          flag =
            await this.countryFlagService.getCountryFlagByCountryCode(country);
        } catch {
          // ignore errors
        }

        const sum = summaries[i];
        const dto = new BhopRecentTimeDto();
        dto.date = time.date;
        dto.map = time.map;
        dto.mapType = time.map_type;
        dto.player = time.user_auth ?? time.auth;
        dto.playerNickname = sum?.nickname ?? null;
        dto.playerProfileUrl = sum?.profileUrl ?? null;
        dto.playerAvatar = sum?.avatar ?? null;
        dto.playerLocationCountry = country;
        dto.playerLocationCountryFlag = flag;
        dto.points = time.points;
        dto.rank = (paged.meta.page - 1) * paged.meta.pageSize + i + 1;
        dto.runTime = time.time;
        dto.runTimeDifference = runTimeDiff;
        dto.style = Style[time.style];
        dto.tier = time.tier;
        dto.track = Track[time.track];
        return dto;
      }),
    );

    return {
      data,
      meta: paged.meta,
      links: paged.links,
    };
  }
}
