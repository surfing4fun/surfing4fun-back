import { Injectable } from '@nestjs/common';

import { SurfPrismaService } from '../../../shared/prisma/surf.service';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { CompletedMapsTierDto, MapCompletionDto } from './dto/map-completion.dto';
import { SteamService } from '../../steam/steam.service';
import { CountryFlagService } from '../../country-flag/country-flag.service';

@Injectable()
export class UserProfileService {
  constructor(
    private readonly prisma: SurfPrismaService,
    private readonly steamService: SteamService,
    private readonly countryFlagService: CountryFlagService,
  ) {}

  async getUserProfile(
    userId: number,
  ): Promise<UserProfileResponseDto> {

    const user = await this.prisma.users.findUnique({
      where: { auth: userId },
      select: {
        ip:         true,
        auth:       true,
        name:       true,
        firstlogin: true,
        lastlogin:  true,
        points:     true,
        playtime:   true,
      },
    });

    if (!user) {
      // handle “not found” as you prefer
      return;
    }

    // Get Steam summaries
    const steamUser = await this.steamService.getPlayerSummary(userId)

    // 
    let userCountry: string | null = null;
    let userCountryFlag: string | null = null;
    try {
      userCountry = await this.countryFlagService.getCountryCodeByLongIp(
        user.ip,
      );
      userCountryFlag =
        await this.countryFlagService.getCountryFlagByCountryCode(userCountry);
    } catch (error) {
      // ignore errors
    }

    const [{ count: worldRecordsBonus }] = await this.prisma.$queryRaw<
      Array<{ count: number }>
    >`
      SELECT
        COUNT(DISTINCT bests.map, bests.track) AS count
      FROM (
        SELECT map, track, MIN(time) AS best_time
        FROM playertimes
        WHERE style = 0
          AND track != 0
        GROUP BY map, track
      ) AS bests
      JOIN playertimes pt
        ON pt.map   = bests.map
      AND pt.track = bests.track
      AND pt.time  = bests.best_time
      AND pt.style = 0
      WHERE pt.auth = ${userId};
    `;



    const [{ count: worldRecordsMap }] = await this.prisma.$queryRaw<
      Array<{ count: number }>
    >`
      SELECT
        COUNT(DISTINCT bests.map) AS count
      FROM (
        SELECT map, MIN(time) AS best_time
        FROM playertimes
        WHERE style = 0
          AND track = 0
        GROUP BY map
      ) AS bests
      JOIN playertimes pt
        ON pt.map   = bests.map
      AND pt.time  = bests.best_time
      AND pt.style = 0
      AND pt.track = 0
      WHERE pt.auth = ${userId};
    `;

    const [{ count: worldRecordsStage }] = await this.prisma.$queryRaw<
      Array<{ count: number }>
    >`
      SELECT
        COUNT(DISTINCT st.map, st.stage) AS count
      FROM (
        SELECT map, stage, MIN(time) AS best_time
        FROM stagetimes
        WHERE style = 0
        GROUP BY map, stage
      ) AS bests
      JOIN stagetimes st
        ON st.map    = bests.map
      AND st.stage  = bests.stage
      AND st.time   = bests.best_time
      AND st.style  = 0
      WHERE st.auth = ${userId};
    `;

    const [{ count: totalPlayedMaps }] = await this.prisma.$queryRaw<
      Array<{ count: number }>
    >`
      SELECT COUNT(DISTINCT map) AS count
      FROM playertimes
      WHERE auth = ${userId}
        AND style = 0
        AND track = 0;
    `;

    const [{ count: totalPlayedMapsBonus }] = await this.prisma.$queryRaw<
      Array<{ count: number }>
    >`
      SELECT COUNT(map) AS count
      FROM playertimes
      WHERE auth = ${userId}
        AND style = 0
        AND track != 0;
    `;

    const [{ count: totalPlayedStages }] = await this.prisma.$queryRaw<
      Array<{ count: number }>
    >`
      SELECT COUNT(DISTINCT map, stage) AS count
      FROM stagetimes
      WHERE auth = ${userId}
        AND style = 0;
    `;

  // 1) Total main maps (that ‘spawn’ on track 0):
  //    – you can either use the maptiers table…
  // const totalMapsCount = await this.prisma.maptiers.count();

    const [{ count: totalMapsCount }] = await this.prisma.$queryRaw<
      Array<{ count: number }>
    >`
      SELECT COUNT(DISTINCT map) AS count
      FROM mapzones
      WHERE type  = 0
        AND track = 0;
    `;

    // 2) Total bonus maps (that ‘spawn’ on any track > 0):
    const [{ count: totalBonusCount }] = await this.prisma.$queryRaw<
      Array<{ count: number }>
    >`
      SELECT
        COUNT(DISTINCT map) AS count
      FROM mapzones
      WHERE type    = 0
        AND track  > 0;
    `;

    const [{ count: totalStagesCount }] = await this.prisma.$queryRaw<
      Array<{ count: number }>
    >`
      SELECT
        SUM(max_stage) AS count
      FROM (
        SELECT
          MAX(data) AS max_stage
        FROM mapzones
        WHERE type = 2
        GROUP BY map
      ) AS t;
    `;

    // 1) Instantiate the root DTO
    const dto = new UserProfileDto();

    // 2) Top-level “profile” fields
    dto.serverRank           = 1;
    dto.locationCountry      = userCountry;
    dto.locationFlag         = userCountryFlag;
    dto.totalPoints          = user.points;
    dto.totalPlaytime        = user.playtime;
    dto.firstSeen            = user.firstlogin;
    dto.lastSeen             = user.lastlogin;
    dto.worldRecordsMap      = worldRecordsMap;
    dto.worldRecordsBonus    = worldRecordsBonus;
    dto.worldRecordsStage    = worldRecordsStage;
    dto.totalPlayedMaps      = totalPlayedMaps;
    dto.totalPlayedMapsBonus = totalPlayedMapsBonus;
    dto.totalPlayedStages    = totalPlayedStages;
    dto.totalMapsCount       = totalMapsCount
    dto.totalStagesCount     = totalStagesCount
    dto.totalBonusCount      = totalBonusCount

    dto.playerNickname        = steamUser?.nickname ?? null;
    dto.playerProfileUrl      = steamUser?.profileUrl ?? null;
    dto.playerAvatar          = steamUser?.avatar ?? null;

    // 3) Nested “mapCompletion” block
    dto.mapCompletion = new MapCompletionDto();
    dto.mapCompletion.completedMapsPercentage   = 80;
    dto.mapCompletion.completedStagesPercentage = 70;
    dto.mapCompletion.completedBonusPercentage  = 55;
    dto.mapCompletion.mostPlayedMap            = 'surf_utopia';

    // 4) Populate tiers 1–8 with example numbers
    dto.mapCompletion.completedMapsTier = Array.from({ length: 8 }, (_, idx) => {
      const tierLevel       = idx + 1;
      const totalInTier     = 5 + idx * 2;                              // e.g. 5,7,9…
      const completedCount  = Math.floor(totalInTier * 0.6);            // ~60% done
      const percentComplete = Math.round((completedCount / totalInTier) * 100);

      const tierDto = new CompletedMapsTierDto();
      tierDto.tier                    = tierLevel;
      tierDto.completedMaps           = completedCount;
      tierDto.totalMaps               = totalInTier;
      tierDto.completedMapsPercentage = percentComplete;
      return tierDto;
    });

    // 5) Wrap it in your response DTO
    const response = new UserProfileResponseDto();
    response.data = dto;
    return response;
  }
}