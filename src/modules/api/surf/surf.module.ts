import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { MaptiersModule } from './maptiers/maptiers.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    MaptiersModule,
    UsersModule,
    RouterModule.register([
      {
        path: 'surf',
        children: [MaptiersModule, UsersModule],
      },
    ]),
  ],
})
export class SurfModule {}
