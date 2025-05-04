import { Module } from '@nestjs/common';

import { PaginatorService, PRISMA_SERVICE } from './services/paginator.service';

import { BhopPrismaService } from '../shared/prisma/bhop.service';
import { SurfPrismaService } from '../shared/prisma/surf.service';

@Module({
  providers: [
    {
      provide: PRISMA_SERVICE,
      useExisting: [SurfPrismaService, BhopPrismaService],
    },
    PaginatorService,
  ],
  exports: [PaginatorService],
})
export class HelpersModule {}
