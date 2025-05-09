import { Module } from '@nestjs/common';
import { HelpersModule } from 'src/modules/helpers/helpers.module';

import { ServerHealthController } from './server-health.controller';
import { ServerHealthService } from './server-health.service';

@Module({
  imports: [HelpersModule],
  providers: [ServerHealthService],
  controllers: [ServerHealthController],
})
export class ServerHealthModule {}
