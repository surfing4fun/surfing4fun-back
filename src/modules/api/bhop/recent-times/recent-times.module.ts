import { Module } from '@nestjs/common';
import { BhopPrismaService } from 'src/modules/shared/prisma/bhop.service';

import { SteamModule } from '../../steam/steam.module';
import { CountryFlagModule } from '../../country-flag/country-flag.module';

import { RecentTimesController } from './recent-times.controller';
import { RecentTimesService } from './recent-times.service';

@Module({
  controllers: [RecentTimesController],
  imports: [SteamModule, CountryFlagModule],
  providers: [RecentTimesService, BhopPrismaService],
})
export class RecentTimesModule {}
