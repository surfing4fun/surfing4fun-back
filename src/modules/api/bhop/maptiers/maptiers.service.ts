import { Injectable } from '@nestjs/common';
import { MeasureRequestDuration } from 'src/decorators/MeasureRequestDuration.decorator';

import { BhopPrismaService } from '../../../shared/prisma/bhop.service';

@Injectable()
export class MaptiersService {
  constructor(private readonly prisma: BhopPrismaService) {}

  @MeasureRequestDuration()
  async getMaptiers(map?: string) {
    try {
      const where = map ? { map } : {};

      const maptiers = await this.prisma.maptiers.findMany({
        where,
        select: {
          map: true,
          tier: true,
          possible_on_400vel: true,
          possible_on_scroll: true,
          possible_on_stamina: true,
          map_type: true,
        },
      });

      return maptiers;
    } catch (error) {
      throw new Error(`Failed to fetch maptiers: ${error.message}`);
    }
  }
}
