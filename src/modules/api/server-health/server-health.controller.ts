import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/decorators/Public';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { ServerHealthService } from './server-health.service';
import { ServerHealthResponseDto } from './dto/server-health-responses.dto';

@Public()
@ApiTags('server-health')
@Controller('server-health')
export class ServerHealthController {
  constructor(private readonly healthService: ServerHealthService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve health status of all game servers' })
  @ApiOkResponse({
    description: 'Health status retrieved successfully',
    schema: {
      example: {
        ip: '203.0.113.1',
        timestamp: '2025-05-01T12:34:56.789Z',
        servers: [
          {
            name: 'My Server',
            address: '203.0.113.1:27015',
            map: 'de_dust2',
            players: '10/32',
            bots: 2,
            serverType: 'dedicated',
            environment: 'Linux',
            visibility: 'public',
            vac: 'enabled',
            version: '1.0.0.1',
            playerList: [{ name: 'Player1', score: 20, duration: 300 }],
          },
        ],
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Failed to fetch health data',
  })
  getHealth(): Promise<ServerHealthResponseDto> {
    return this.healthService.getHealthCheck();
  }
}
