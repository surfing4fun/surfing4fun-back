import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { CountryFlagService } from './country-flag.service';

@Module({
  imports: [HttpModule],
  providers: [CountryFlagService],
  exports: [CountryFlagService],
})
export class CountryFlagModule {}
