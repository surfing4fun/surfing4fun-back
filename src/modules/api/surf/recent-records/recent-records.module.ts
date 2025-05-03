import { Module } from '@nestjs/common';
import { SurfPrismaService } from 'src/modules/shared/prisma/surf.service';

import { SteamModule } from '../../steam/steam.module';

import { RecentRecordsController } from './recent-records.controller';
import { RecentRecordsService } from './recent-records.service';

@Module({
  controllers: [RecentRecordsController],
  imports: [SteamModule],
  providers: [RecentRecordsService, SurfPrismaService],
})
export class RecentRecordsModule {}
