import { Controller, Get, Query } from '@nestjs/common';
import { Public } from 'src/decorators/Public.decorator';

import { RecentTimesService } from './recent-times.service';

@Public()
@Controller('recent-times')
export class RecentTimesController {
  constructor(private readonly recentTimesService: RecentTimesService) {}

  @Get()
  async getRecentTimes(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
  ) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSizeNum = Math.max(1, parseInt(pageSize, 10) || 10);
    return this.recentTimesService.getRecentTimes({
      page: pageNum,
      pageSize: pageSizeNum,
    });
  }
}
