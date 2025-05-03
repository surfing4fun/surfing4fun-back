import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/decorators/Public.decorator';

import { ServerStatusService } from './server-status.service';

@Public()
@Controller('server-status')
export class ServerStatusController {
  constructor(private readonly serverStatusService: ServerStatusService) {}

  @Get()
  async getServerStatus() {
    return this.serverStatusService.getServerStatus();
  }
}
