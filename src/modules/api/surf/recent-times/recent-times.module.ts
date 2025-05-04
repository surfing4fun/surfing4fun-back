import { Module } from '@nestjs/common';
import { PaginatorService } from 'src/modules/helpers/services/paginator.service';
import { SurfPrismaService } from 'src/modules/shared/prisma/surf.service';

import { RecentTimesController } from './recent-times.controller';
import { RecentTimesService } from './recent-times.service';

import { CountryFlagModule } from '../../country-flag/country-flag.module';
import { SteamModule } from '../../steam/steam.module';

@Module({
  controllers: [RecentTimesController],
  imports: [SteamModule, CountryFlagModule],
  providers: [RecentTimesService, SurfPrismaService, PaginatorService],
})
export class RecentTimesModule {}
