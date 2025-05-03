import { Module } from '@nestjs/common';
import { BhopPrismaService } from 'src/modules/shared/prisma/bhop.service';

import { MaptiersController } from './maptiers.controller';
import { MaptiersService } from './maptiers.service';

@Module({
  providers: [MaptiersService, BhopPrismaService],
  controllers: [MaptiersController],
})
export class MaptiersModule {}
