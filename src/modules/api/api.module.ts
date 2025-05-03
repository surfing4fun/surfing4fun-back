import { Module } from '@nestjs/common';

import { SurfModule } from './surf/surf.module';
import { BhopModule } from './bhop/bhop.module';

@Module({
  imports: [SurfModule, BhopModule],
})
export class ApiModule {}
