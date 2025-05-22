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
    dto.worldRecordsMap      = 4;
    dto.worldRecordsBonus    = 1;
    dto.worldRecordsStage    = 8;
    dto.totalPlayedMaps      = 180;
    dto.totalPlayedMapsBonus = 40;
    dto.totalPlayedStages    = 350;

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