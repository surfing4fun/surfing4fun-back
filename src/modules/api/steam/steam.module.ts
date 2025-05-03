import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { SteamService } from './steam.service';

@Module({
  imports: [HttpModule],
  providers: [SteamService],
  exports: [SteamService],
})
export class SteamModule {}
