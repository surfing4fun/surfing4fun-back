import { Injectable } from '@nestjs/common';
import { MeasureRequestDuration } from 'src/decorators/MeasureRequestDuration.decorator';

import { SurfPrismaService } from '../../../shared/prisma/surf.service';

@Injectable()
export class MapsService {
  constructor(private readonly prisma: SurfPrismaService) {}

  @MeasureRequestDuration()
  async getMaps({ map }: { map?: string } = {}) {
    try {
      const where = map ? { map } : {};

      const maps = await this.prisma.maptiers.findMany({
        where,
        select: {
          map: true,
          tier: true,
          maxvelocity: true,
          autobhop_enabled: true,
          map_type: true,
        },
      });

      return maps.map((maptier) => ({
        ...maptier,
        maxvelocity: maptier.maxvelocity?.toString(),
      }));
    } catch (error) {
      throw new Error(`Failed to fetch maps: ${error.message}`);
    }
  }
}
