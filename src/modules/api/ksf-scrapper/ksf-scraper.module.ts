import { Module } from '@nestjs/common';
import { HelpersModule } from 'src/modules/helpers/helpers.module';

import { KsfScraperController } from './ksf-scraper.controller';
import { KsfScraperService } from './ksf-scrapper.service';

@Module({
  imports: [HelpersModule],
  providers: [KsfScraperService],
  controllers: [KsfScraperController],
})
export class KsfScraperModule {}
