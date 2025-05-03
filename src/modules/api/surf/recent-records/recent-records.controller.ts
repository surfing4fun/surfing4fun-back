import { Controller, Get, Query } from '@nestjs/common';
import { Public } from 'src/decorators/Public.decorator';

import { RecentRecordsService } from './recent-records.service';

@Public()
@Controller('recent-records')
export class RecentRecordsController {
  constructor(private readonly recentRecordsService: RecentRecordsService) {}

  @Get()
  async getRecentRecords(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
  ) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSizeNum = Math.max(1, parseInt(pageSize, 10) || 10);
    return this.recentRecordsService.getRecentRecords({
      page: pageNum,
      pageSize: pageSizeNum,
    });
  }
}
