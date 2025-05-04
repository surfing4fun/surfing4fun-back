import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/Public.decorator';

import { RecentTimesService } from './recent-times.service';

@ApiTags('Surf - Recent Times')
@Public()
@Controller('recent-times')
export class RecentTimesController {
  constructor(private readonly recentTimesService: RecentTimesService) {}

  @ApiOperation({ summary: 'Get recent surf times' })
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
    description: 'Returns a list of recent surf times',
  })
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
