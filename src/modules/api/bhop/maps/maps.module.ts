import { Module } from '@nestjs/common';
import { HelpersModule } from 'src/modules/helpers/helpers.module';

import { MapsController } from './maps.controller';
import { MapsService } from './maps.service';

import { BhopPrismaService } from '../../../shared/prisma/bhop.service';

@Module({
  imports: [HelpersModule],
  controllers: [MapsController],
  providers: [MapsService, BhopPrismaService],
})
export class MapsModule {}
