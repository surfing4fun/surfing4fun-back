import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/Public.decorator';

import { getAllMapsDocs, getMapByMapDocs } from './maps.docs';
import { MapsService } from './maps.service';

@ApiTags('Bhop')
@Public()
@Controller('maps')
export class MapsController {
  constructor(private readonly mapsService: MapsService) {}

  @getAllMapsDocs()
  @Get()
  async getAllMaps() {
    return this.mapsService.getMaps();
  }

  @getMapByMapDocs()
  @Get(':map')
  async getMaptierByMap(@Param('map') map: string) {
    return this.mapsService.getMaps({ map });
  }
}
