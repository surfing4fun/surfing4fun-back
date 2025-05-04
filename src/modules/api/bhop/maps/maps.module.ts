import { Module } from '@nestjs/common';

import { BhopPrismaService } from '../../../shared/prisma/bhop.service';
import { MapsController } from './maps.controller';
import { MapsService } from './maps.service';

@Module({
  providers: [MapsService, BhopPrismaService],
  controllers: [MapsController],
})
export class MapsModule {}
