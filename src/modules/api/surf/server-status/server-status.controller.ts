import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/Public.decorator';

import { getServerStatusDocs } from './server-status.docs';
import { ServerStatusService } from './server-status.service';

@ApiTags('Surf')
@Public()
@Controller('server-status')
export class ServerStatusController {
  constructor(private readonly serverStatusService: ServerStatusService) {}

  @getServerStatusDocs()
  @Get()
  async getServerStatus() {
    return this.serverStatusService.getServerStatus();
  }
}
