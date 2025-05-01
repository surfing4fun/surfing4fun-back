// src/scraper/scraper.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { ServerHealthService } from './server-health.service';
import { ServerHealthController } from './server-health.controller';

@Module({
  imports: [HttpModule],
  providers: [ServerHealthService],
  controllers: [ServerHealthController],
})
export class ServerHealthModule {}
