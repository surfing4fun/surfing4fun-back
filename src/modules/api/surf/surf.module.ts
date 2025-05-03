import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { MaptiersModule } from './maptiers/maptiers.module';
import { UsersModule } from './users/users.module';
import { ServerStatusModule } from './server-status/server-status.module';

@Module({
  imports: [
    MaptiersModule,
    UsersModule,
    ServerStatusModule,
    RouterModule.register([
      {
        path: 'surf',
        children: [MaptiersModule, UsersModule, ServerStatusModule],
      },
    ]),
  ],
})
export class SurfModule {}
