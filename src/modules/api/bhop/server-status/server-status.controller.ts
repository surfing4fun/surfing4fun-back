import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/Public.decorator';

import {
  GetServerStatusApiOperation,
  GetServerStatusApiResponse,
} from './server-status.docs';
import { ServerStatusService } from './server-status.service';

@ApiTags('Bhop')
@Public()
@Controller('server-status')
export class ServerStatusController {
  constructor(private readonly serverStatusService: ServerStatusService) {}

  @GetServerStatusApiOperation()
  @GetServerStatusApiResponse()
  @Get()
  async getServerStatus() {
    return this.serverStatusService.getServerStatus();
  }
}
