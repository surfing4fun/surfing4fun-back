// src/scraper/scraper.module.ts
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { KsfScraperController } from './ksf-scraper.controller';
import { KsfScraperService } from './ksf-scrapper.service';

@Module({
  imports: [HttpModule],
  providers: [KsfScraperService],
  controllers: [KsfScraperController],
})
export class KsfScraperModule {}
