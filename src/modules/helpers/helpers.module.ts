import { Module } from '@nestjs/common';

import { PaginatorService } from './services/paginator.service';

@Module({
  providers: [PaginatorService],
  exports: [PaginatorService],
})
export class CommonModule {}
