import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { RecentRecordsModule } from './recent-records/recent-records.module';
import { RecentTimesModule } from './recent-times/recent-times.module';
import { ServerStatusModule } from './server-status/server-status.module';
import { UsersModule } from './users/users.module';

import { MapsModule } from '../bhop/maps/maps.module';

@Module({
  imports: [
    MapsModule,
    UsersModule,
    ServerStatusModule,
    RecentTimesModule,
    RecentRecordsModule,
    RouterModule.register([
      {
        path: 'bhop',
        children: [
          MapsModule,
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
