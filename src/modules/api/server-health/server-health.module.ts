import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { ServerHealthController } from './server-health.controller';
import { ServerHealthService } from './server-health.service';

@Module({
  imports: [HttpModule],
  providers: [ServerHealthService],
  controllers: [ServerHealthController],
})
export class ServerHealthModule {}
