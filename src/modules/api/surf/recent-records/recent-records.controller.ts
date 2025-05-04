import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/Public.decorator';

import { RecentRecordsService } from './recent-records.service';

@ApiTags('Surf - Recent Records')
@Public()
@Controller('recent-records')
export class RecentRecordsController {
  constructor(private readonly recentRecordsService: RecentRecordsService) {}

  @ApiOperation({ summary: 'Get recent surf records' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    type: String,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Items per page',
    type: String,
  })
  @ApiQuery({
    name: 'map',
    required: false,
    description: 'Filter by map name',
    type: String,
  })
  @ApiQuery({
    name: 'style',
    required: false,
    description: 'Filter by surf style',
    type: String,
  })
  @ApiQuery({
    name: 'track',
    required: false,
    description: 'Filter by track number',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of recent surf records',
  })
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
