import { Module } from '@nestjs/common';

import { MapsController } from './maps.controller';
import { MapsService } from './maps.service';

import { SurfPrismaService } from '../../../shared/prisma/surf.service';

@Module({
  providers: [MapsService, SurfPrismaService],
  controllers: [MapsController],
})
export class MapsModule {}
