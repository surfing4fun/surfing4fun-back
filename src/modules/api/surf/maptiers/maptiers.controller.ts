import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/Public.decorator';

import { MaptiersService } from './maptiers.service';

@ApiTags('Surf - Map Tiers')
@Public()
@Controller('maptiers')
export class MaptiersController {
  constructor(private readonly maptiersService: MaptiersService) {}

  @ApiOperation({ summary: 'Get all map tiers' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of all map tiers',
  })
  @Get()
  async getAllMaptiers() {
    return this.maptiersService.getMaptiers();
  }

  @ApiOperation({ summary: 'Get map tier by map name' })
  @ApiParam({
    name: 'map',
    description: 'Map name to get tier information for',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the tier information for the specified map',
  })
  @Get(':map')
  async getMaptierByMap(@Param('map') map: string) {
    return this.maptiersService.getMaptiers({ map });
  }
}
