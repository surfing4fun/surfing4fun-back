import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/Public.decorator';

import { RecentTimesQueryDto } from './dto/recent-times-query.dto';
import { getRecentTimesDocs } from './recent-times.docs';
import { RecentTimesService } from './recent-times.service';

@ApiTags('Bhop')
@Public()
@Controller('recent-times')
export class RecentTimesController {
  constructor(private readonly recentTimesService: RecentTimesService) {}

  @getRecentTimesDocs()
  @Get()
  async getRecentTimes(@Query() query: RecentTimesQueryDto) {
    return this.recentTimesService.getRecentTimes(query);
  }
}
