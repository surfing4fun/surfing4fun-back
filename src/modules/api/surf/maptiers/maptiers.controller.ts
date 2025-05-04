import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/Public.decorator';

import { GetAllMaptiersDocs, GetMaptierByMapDocs } from './maptiers.docs';
import { MaptiersService } from './maptiers.service';

@ApiTags('Surf')
@Public()
@Controller('maptiers')
export class MaptiersController {
  constructor(private readonly maptiersService: MaptiersService) {}

  @GetAllMaptiersDocs()
  @Get()
  async getAllMaptiers() {
    return this.maptiersService.getMaptiers();
  }

  @GetMaptierByMapDocs()
  @Get(':map')
  async getMaptierByMap(@Param('map') map: string) {
    return this.maptiersService.getMaptiers({ map });
  }
}
