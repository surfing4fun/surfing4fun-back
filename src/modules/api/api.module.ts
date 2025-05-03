import { Module } from '@nestjs/common';
import { MaptiersModule } from './maptiers/maptiers.module';

@Module({
  imports: [MaptiersModule],
})
export class ApiModule {} 