import { Module } from '@nestjs/common';
import { HelpersModule } from 'src/modules/helpers/helpers.module';

import { CountryFlagService } from './country-flag.service';

@Module({
  imports: [HelpersModule],
  providers: [CountryFlagService],
  exports: [CountryFlagService],
})
export class CountryFlagModule {}
