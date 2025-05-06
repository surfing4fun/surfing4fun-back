import { Injectable } from '@nestjs/common';
import { PaginationLinksResponseDto } from 'src/modules/helpers/dto/pagination-links-response.dto';
import { PaginationMetaResponseDto } from 'src/modules/helpers/dto/pagination-meta-response.dto';
import {
  IPrismaQueryable,
  PaginatorService,
} from 'src/modules/helpers/services/paginator.service';

import { SurfRecentRecordDto } from './dto/recent-record.dto';
import { SurfRecentRecordsQueryDto } from './dto/recent-records-query.dto';
import { SurfRecentRecordsResponseDto } from './dto/recent-records-response.dto';

import { SurfPrismaService } from '../../../shared/prisma/surf.service';
import { CountryFlagService } from '../../country-flag/country-flag.service';
import { SteamService } from '../../steam/steam.service';
import { Style } from '../constants/styles.enum';
import { Track } from '../constants/tracks.enum';

@Injectable()
export class RecentRecordsService {
  constructor(
    private readonly prisma: SurfPrismaService,
    private readonly steamService: SteamService,
    private readonly countryFlagService: CountryFlagService,
    private readonly paginator: PaginatorService,
  ) {}

  async getRecentRecords(
    query: SurfRecentRecordsQueryDto,
  ): Promise<SurfRecentRecordsResponseDto> {
    const { page, pageSize, map, style, track } = query;
    const pageNum = Math.max(1, Number(page));
    const pageSizeNum = Math.max(1, Number(pageSize));

    const clauses: string[] = [];
    if (map) clauses.push(`pt.map = '${map}'`);
    if (typeof style === 'number') clauses.push(`pt.style = ${style}`);
    if (typeof track === 'number') clauses.push(`pt.track = ${track}`);
    const whereSql = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const baseSql = `
      WITH ranked_times AS (
        SELECT
          pt.id, pt.auth, pt.map, pt.track, pt.time,
          pt.points, pt.date, pt.style,
          u.auth AS user_auth, u.ip AS user_ip,
          mt.map_type, mt.tier,
          ROW_NUMBER() OVER (
            PARTITION BY pt.map, pt.track
            ORDER BY pt.time ASC
          ) AS time_rank
        FROM playertimes pt
        LEFT JOIN users u     ON pt.auth = u.auth
        LEFT JOIN maptiers mt ON pt.map = mt.map
        ${whereSql}
      )
      SELECT rt1.*, rt2.time AS second_best_time
      FROM ranked_times rt1
      LEFT JOIN ranked_times rt2
        ON rt1.map = rt2.map
        AND rt1.track = rt2.track
        AND rt2.time_rank = 2
      WHERE rt1.time_rank = 1
      ORDER BY rt1.date DESC
    `;

    const paged = await this.paginator.paginateSqlAutoCount<any>(
      this.prisma as unknown as IPrismaQueryable,
      baseSql,
      'playertimes pt',
      whereSql,
      pageNum,
      pageSizeNum,
      (p) => `/recent-records?page=${p}&pageSize=${pageSizeNum}`,
    );

    const summaries = await Promise.all(
      paged.data.map((r) => this.steamService.getPlayerSummary(r.auth)),
    );

    const data: SurfRecentRecordDto[] = await Promise.all(
      paged.data.map(async (record, idx) => {
        const secondTime = (record as any).second_best_time as number | null;
        const runTimeDiff =
          secondTime != null ? record.time - secondTime : null;

        let country: string | null = null;
        let flag: string | null = null;
        try {
          country = await this.countryFlagService.getCountryCodeByLongIp(
            record.user_ip,
          );
          flag =
            await this.countryFlagService.getCountryFlagByCountryCode(country);
        } catch {
          // ignore
        }

        const sum = summaries[idx];
        return {
          date: record.date,
          map: record.map,
          mapType: record.map_type,
          player: record.user_auth ?? record.auth,
          playerNickname: sum?.nickname ?? null,
          playerProfileUrl: sum?.profileUrl ?? null,
          playerAvatar: sum?.avatar ?? null,
          playerLocationCountry: country,
          playerLocationCountryFlag: flag,
          points: record.points,
          rank: (paged.meta.page - 1) * paged.meta.pageSize + idx + 1,
          runTime: record.time,
          runTimeDifference: runTimeDiff,
          style: Style[record.style],
          tier: record.tier,
          track: Track[record.track],
        };
      }),
    );

    return {
      data,
      meta: paged.meta as PaginationMetaResponseDto,
      links: paged.links as PaginationLinksResponseDto,
    };
  }
}
