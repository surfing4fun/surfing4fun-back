import { Module } from '@nestjs/common';
import { HelpersModule } from 'src/modules/helpers/helpers.module';
import { PaginatorService } from 'src/modules/helpers/services/paginator.service';
import { BhopPrismaService } from 'src/modules/shared/prisma/bhop.service';

import { RecentRecordsController } from './recent-records.controller';
import { RecentRecordsService } from './recent-records.service';

import { CountryFlagModule } from '../../country-flag/country-flag.module';
import { SteamModule } from '../../steam/steam.module';
@Module({
  controllers: [RecentRecordsController],
  imports: [SteamModule, CountryFlagModule, HelpersModule],
  providers: [RecentRecordsService, BhopPrismaService, PaginatorService],
})
export class RecentRecordsModule {}
