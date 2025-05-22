import { Module } from '@nestjs/common';
import { HelpersModule } from 'src/modules/helpers/helpers.module';

import { UserProfileController } from './user-profile.controller';
import { UserProfileService } from './user-profile.service';

import { SurfPrismaService } from '../../../shared/prisma/surf.service';
import { SteamModule } from '../../steam/steam.module';
import { CountryFlagModule } from '../../country-flag/country-flag.module';

@Module({
  imports: [HelpersModule, SteamModule, CountryFlagModule],
  providers: [UserProfileService, SurfPrismaService],
  controllers: [UserProfileController],
})
export class UserProfileModule {}
