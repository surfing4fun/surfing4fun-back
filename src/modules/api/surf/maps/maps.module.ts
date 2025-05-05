import { Module } from '@nestjs/common';
import { HelpersModule } from 'src/modules/helpers/helpers.module';

import { MapsController } from './maps.controller';
import { MapsService } from './maps.service';

import { SurfPrismaService } from '../../../shared/prisma/surf.service';

@Module({
  imports: [HelpersModule],
  providers: [MapsService, SurfPrismaService],
  controllers: [MapsController],
})
export class MapsModule {}
