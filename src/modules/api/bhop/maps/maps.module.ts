import { Module } from '@nestjs/common';

import { MapsController } from './maps.controller';
import { MapsService } from './maps.service';

import { BhopPrismaService } from '../../../shared/prisma/bhop.service';

@Module({
  providers: [MapsService, BhopPrismaService],
  controllers: [MapsController],
})
export class MapsModule {}
