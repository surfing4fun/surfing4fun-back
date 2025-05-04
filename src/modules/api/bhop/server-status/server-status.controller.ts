import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/decorators/Public.decorator';

import {
  GetServerStatusApiOperation,
  GetServerStatusApiResponse,
  ServerStatusApiTags,
} from './server-status.docs';
import { ServerStatusService } from './server-status.service';

@ServerStatusApiTags()
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
