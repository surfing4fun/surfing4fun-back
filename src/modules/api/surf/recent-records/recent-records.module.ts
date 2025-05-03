import { Module } from '@nestjs/common';
import { SurfPrismaService } from 'src/modules/shared/prisma/surf.service';

import { RecentRecordsController } from './recent-records.controller';
import { RecentRecordsService } from './recent-records.service';
import { CountryFlagModule } from '../../country-flag/country-flag.module';
import { SteamModule } from '../../steam/steam.module';

@Module({
  controllers: [RecentRecordsController],
  imports: [SteamModule, CountryFlagModule],
  providers: [RecentRecordsService, SurfPrismaService],
})
export class RecentRecordsModule {}
