import { Module } from '@nestjs/common';

import { BhopModule } from './bhop/bhop.module';
import { SurfModule } from './surf/surf.module';

@Module({
  imports: [SurfModule, BhopModule],
})
export class ApiModule {}
