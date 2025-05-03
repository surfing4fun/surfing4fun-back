import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { RecentRecordsModule } from './recent-records/recent-records.module';
import { MaptiersModule } from './maptiers/maptiers.module';
import { UsersModule } from './users/users.module';
import { ServerStatusModule } from './server-status/server-status.module';
import { RecentTimesModule } from './recent-times/recent-times.module';

@Module({
  imports: [
    MaptiersModule,
    UsersModule,
    ServerStatusModule,
    RecentTimesModule,
    RecentRecordsModule,
    RouterModule.register([
      {
        path: 'bhop',
        children: [
          MaptiersModule,
          UsersModule,
          ServerStatusModule,
          RecentTimesModule,
          RecentRecordsModule,
        ],
      },
    ]),
  ],
})
export class BhopModule {}
