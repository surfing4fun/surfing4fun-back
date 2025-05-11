import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/Public.decorator';

import { BhopRecentRecordsQueryDto } from './dto/recent-records-query.dto';
import { BhopRecentRecordsResponseDto } from './dto/recent-records-response.dto';
import { RecentRecordsService } from './recent-records.service';

import { getRecentRecordsDocs } from '../../bhop/recent-records/recent-records.docs';

@ApiTags('Bhop')
@Public()
@Controller('recent-records')
export class RecentRecordsController {
  constructor(private readonly recentRecordsService: RecentRecordsService) {}

  @getRecentRecordsDocs()
  @Get()
  async getRecentRecords(
    @Query() query: BhopRecentRecordsQueryDto,
  ): Promise<BhopRecentRecordsResponseDto> {
    return this.recentRecordsService.getRecentRecords({
      page: query.page,
      pageSize: query.pageSize,
      map: query.map,
      style: query.style,
      track: query.track,
    });
  }
}
