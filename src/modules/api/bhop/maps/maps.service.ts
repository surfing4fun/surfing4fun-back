import { Injectable } from '@nestjs/common';

import { BhopPrismaService } from '../../../shared/prisma/bhop.service';

@Injectable()
export class MapsService {
  constructor(private readonly prisma: BhopPrismaService) {}

  async getMaps(map?: string) {
    try {
      const where = map ? { map } : {};

      const maps = await this.prisma.maptiers.findMany({
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

      return maps;
    } catch (error) {
      throw new Error(`Failed to fetch maps: ${error.message}`);
    }
  }
}
