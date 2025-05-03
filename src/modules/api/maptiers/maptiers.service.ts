import { Injectable } from '@nestjs/common';

import { SurfPrismaService } from '../../shared/prisma/surf.service';

@Injectable()
export class MaptiersService {
  constructor(private readonly prisma: SurfPrismaService) {}

  async getMaptiers(map?: string) {
    try {
      const where = map ? { map } : {};

      const maptiers = await this.prisma.maptiers.findMany({
        where,
        select: {
          map: true,
          tier: true,
          maxvelocity: true,
          autobhop_enabled: true,
          map_type: true,
        },
      });

      return maptiers.map((maptier) => ({
        ...maptier,
        maxvelocity: maptier.maxvelocity?.toString(),
      }));
    } catch (error) {
      throw new Error(`Failed to fetch maptiers: ${error.message}`);
    }
  }
}
