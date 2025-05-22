import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { MapsModule } from './maps/maps.module';
import { RecentRecordsModule } from './recent-records/recent-records.module';
import { RecentTimesModule } from './recent-times/recent-times.module';
import { ServerStatusModule } from './server-status/server-status.module';
import { UsersModule } from './users/users.module';
import { UserProfileModule } from './user-profile/user-profile.module';

@Module({
  imports: [
    MapsModule,
    UsersModule,
    ServerStatusModule,
    RecentTimesModule,
    RecentRecordsModule,
    UserProfileModule,
    RouterModule.register([
      {
        path: 'surf',
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
export class SurfModule {}
