import { Module } from '@nestjs/common';
import { BhopPrismaService } from 'src/modules/shared/prisma/bhop.service';

import { SteamModule } from '../../steam/steam.module';
import { CountryFlagModule } from '../../country-flag/country-flag.module';

import { RecentRecordsController } from './recent-records.controller';
import { RecentRecordsService } from './recent-records.service';

@Module({
  controllers: [RecentRecordsController],
  imports: [SteamModule, CountryFlagModule],
  providers: [RecentRecordsService, BhopPrismaService],
})
export class RecentRecordsModule {}
