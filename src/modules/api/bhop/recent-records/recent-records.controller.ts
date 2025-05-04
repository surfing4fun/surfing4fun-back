import { Controller, Get, Query } from '@nestjs/common';
import { Public } from 'src/decorators/Public.decorator';

import {
  GetRecentRecordsApiOperation,
  GetRecentRecordsApiResponse,
  RecentRecordsApiTags,
} from './recent-records.docs';
import { RecentRecordsService } from './recent-records.service';

@RecentRecordsApiTags()
@Public()
@Controller('recent-records')
export class RecentRecordsController {
  constructor(private readonly recentRecordsService: RecentRecordsService) {}

  @GetRecentRecordsApiOperation()
  @GetRecentRecordsApiResponse()
  @Get()
  async getRecentRecords(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('map') map?: string,
    @Query('style') style?: string,
    @Query('track') track?: string,
  ) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSizeNum = Math.max(1, parseInt(pageSize, 10) || 10);
    return this.recentRecordsService.getRecentRecords({
      page: pageNum,
      pageSize: pageSizeNum,
      map,
      style: style !== undefined ? Number(style) : undefined,
      track: track !== undefined ? Number(track) : undefined,
    });
  }
}
