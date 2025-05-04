import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/Public.decorator';

import { ServerStatusService } from './server-status.service';

@ApiTags('Surf - Server Status')
@Public()
@Controller('server-status')
export class ServerStatusController {
  constructor(private readonly serverStatusService: ServerStatusService) {}

  @ApiOperation({ summary: 'Get surf server status' })
  @ApiResponse({
    status: 200,
    description: 'Returns the current status of the surf server',
  })
  @Get()
  async getServerStatus() {
    return this.serverStatusService.getServerStatus();
  }
}
