import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { CountryFlagService } from './country-flag.service';

@Module({
  imports: [HttpModule],
  providers: [CountryFlagService],
  exports: [CountryFlagService],
})
export class CountryFlagModule {}
