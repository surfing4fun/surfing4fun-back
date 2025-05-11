import { Module } from '@nestjs/common';
import { HelpersModule } from 'src/modules/helpers/helpers.module';

import { SteamService } from './steam.service';

@Module({
  imports: [HelpersModule],
  providers: [SteamService],
  exports: [SteamService],
})
export class SteamModule {}
