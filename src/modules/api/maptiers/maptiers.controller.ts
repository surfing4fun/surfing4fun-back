import { Controller, Get, Param } from '@nestjs/common';
import { Public } from 'src/decorators/Public';

import { MaptiersService } from './maptiers.service';

@Public()
@Controller('maptiers')
export class MaptiersController {
  constructor(private readonly maptiersService: MaptiersService) {}

  @Get()
  async getAllMaptiers() {
    return this.maptiersService.getMaptiers();
  }

  @Get(':map')
  async getMaptierByMap(@Param('map') map: string) {
    return this.maptiersService.getMaptiers(map);
  }
}
