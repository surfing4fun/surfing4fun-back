import { Module } from '@nestjs/common';
import { BhopPrismaService } from 'src/modules/shared/prisma/bhop.service';

import { MaptiersService } from './maptiers.service';
import { MaptiersController } from './maptiers.controller';

@Module({
  providers: [MaptiersService, BhopPrismaService],
  controllers: [MaptiersController],
})
export class MaptiersModule {}
