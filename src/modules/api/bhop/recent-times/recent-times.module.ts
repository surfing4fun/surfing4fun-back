import { Module } from '@nestjs/common';
import { HelpersModule } from 'src/modules/helpers/helpers.module';
import { PaginatorService } from 'src/modules/helpers/services/paginator.service';
import { BhopPrismaService } from 'src/modules/shared/prisma/bhop.service';

import { RecentTimesController } from './recent-times.controller';
import { RecentTimesService } from './recent-times.service';

import { CountryFlagModule } from '../../country-flag/country-flag.module';
import { SteamModule } from '../../steam/steam.module';

@Module({
  controllers: [RecentTimesController],
  imports: [SteamModule, CountryFlagModule, HelpersModule],
  providers: [RecentTimesService, BhopPrismaService, PaginatorService],
})
export class RecentTimesModule {}
