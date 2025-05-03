import { Module } from '@nestjs/common';

import { MaptiersController } from './maptiers.controller';
import { MaptiersService } from './maptiers.service';
import { SurfPrismaService } from '../../../shared/prisma/surf.service';

@Module({
  providers: [MaptiersService, SurfPrismaService],
  controllers: [MaptiersController],
})
export class MaptiersModule {}
