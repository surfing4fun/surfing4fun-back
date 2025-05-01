// src/scraper/scraper.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { KsfScraperService } from './ksf-scrapper.service';
import { KsfScraperController } from './ksf-scraper.controller';

@Module({
  imports: [HttpModule],
  providers: [KsfScraperService],
  controllers: [KsfScraperController],
})
export class KsfScraperModule {}
