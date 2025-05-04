import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/Public.decorator';

import { SurfRecentRecordsQueryDto } from './dto/recent-records-query.dto';
import { SurfRecentRecordsResponseDto } from './dto/recent-records-response.dto';
import { getRecentRecordsDocs } from './recent-records.docs';
import { RecentRecordsService } from './recent-records.service';

@ApiTags('Surf')
@Public()
@Controller('recent-records')
export class RecentRecordsController {
  constructor(private readonly recentRecordsService: RecentRecordsService) {}

  @getRecentRecordsDocs()
  @Get()
  async getRecentRecords(
    @Query() query: SurfRecentRecordsQueryDto,
  ): Promise<SurfRecentRecordsResponseDto> {
    return this.recentRecordsService.getRecentRecords({
      page: query.page,
      pageSize: query.pageSize,
      map: query.map,
      style: query.style,
      track: query.track,
    });
  }
}
