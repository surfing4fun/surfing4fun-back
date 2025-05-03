import { Module } from '@nestjs/common';

import { SurfPrismaService } from '../../shared/prisma/surf.service';

import { MaptiersService } from './maptiers.service';
import { MaptiersController } from './maptiers.controller';

@Module({
  providers: [MaptiersService, SurfPrismaService],
  controllers: [MaptiersController],
})
export class MaptiersModule {}
