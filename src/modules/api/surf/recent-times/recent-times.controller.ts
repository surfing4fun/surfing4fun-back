import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/Public.decorator';
import { getRecentTimesDocs } from './recent-times.docs';

import { RecentTimesService } from './recent-times.service';

@ApiTags('Surf')
@Public()
@Controller('recent-times')
export class RecentTimesController {
  constructor(private readonly recentTimesService: RecentTimesService) {}

  @getRecentTimesDocs()
  @Get()
  async getRecentTimes(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('map') map?: string,
    @Query('style') style?: string,
    @Query('track') track?: string,
  ) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSizeNum = Math.max(1, parseInt(pageSize, 10) || 10);
    return this.recentTimesService.getRecentTimes({
      page: pageNum,
      pageSize: pageSizeNum,
      map,
      style: style !== undefined ? Number(style) : undefined,
      track: track !== undefined ? Number(track) : undefined,
    });
  }
}
