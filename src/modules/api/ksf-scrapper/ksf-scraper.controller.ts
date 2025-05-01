import {
  Controller,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Public } from 'src/decorators/Public';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { KsfScraperService } from './ksf-scrapper.service';

@Public()
@ApiTags('ksf-scraper')
@Controller('ksf-scraper')
export class KsfScraperController {
  constructor(private readonly scraperService: KsfScraperService) {}

  @Get(':mapName')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get map leaderboard and stats by name' })
  @ApiParam({
    name: 'mapName',
    required: true,
    description: 'Name of the map to scrape (e.g. surf_me)',
    example: 'surf_me',
  })
  @ApiQuery({
    name: 'full',
    required: false,
    description:
      'Whether to return full top-10 list (true) or only top-1 (false)',
    type: Boolean,
    example: true,
  })
  @ApiOkResponse({
    description: 'Scraper data returned successfully',
    schema: {
      example: {
        map: 'surf_me',
        tier: 5,
        stages: 3,
        bonuses: 2,
        styles: {
          forward: { mapRecords: [], bonusesRecords: {} },
          sideways: { mapRecords: [], bonusesRecords: {} },
          halfsideways: { mapRecords: [], bonusesRecords: {} },
          backwards: { mapRecords: [], bonusesRecords: {} },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid mapName or query parameter' })
  async getMap(
    @Param('mapName') mapName: string,
    @Query('full') full?: string,
  ) {
    if (mapName === 'favicon.ico') {
      return;
    }
    const fullList = full === '1' || full === 'true';
    return this.scraperService.getMap(mapName, fullList);
  }
}
