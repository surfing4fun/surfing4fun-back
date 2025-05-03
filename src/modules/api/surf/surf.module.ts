import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

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
    RouterModule.register([
      {
        path: 'surf',
        children: [
          MaptiersModule,
          UsersModule,
          ServerStatusModule,
          RecentTimesModule,
        ],
      },
    ]),
  ],
})
export class SurfModule {}
