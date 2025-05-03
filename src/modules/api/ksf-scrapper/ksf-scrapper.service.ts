import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as cheerio from 'cheerio';
import { firstValueFrom } from 'rxjs';

interface ICacheEntry {
  timestamp: number;
  data: any;
}

@Injectable()
export class KsfScraperService {
  private cache: Record<string, ICacheEntry> = {};
  private readonly CACHE_TTL = 120_000; // 120 seconds

  constructor(private readonly httpService: HttpService) {}

  private async fetchPage(url: string): Promise<cheerio.CheerioAPI> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64)' },
          timeout: 5000,
        }),
      );
      return cheerio.load(response.data);
    } catch (err: any) {
      throw new HttpException(
        `Failed to fetch page: ${err.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  private scrapeTop10($: cheerio.CheerioAPI): any[] {
    // Only include elements that contain a player link
    const rows = $('div.grid-cols-subgrid')
      .filter((_, el) => $(el).find('a[href^="/players/"]').length > 0)
      .toArray()
      .slice(0, 10);

    return rows.map((el) => {
      const $el = $(el);
      const cols = $el.children('div');

      const rank = parseInt(cols.eq(0).text().trim(), 10);
      const playerBlock = cols.eq(1);
      const timeBlock = cols.eq(2);
      const dateBlock = cols.eq(3);

      const name = playerBlock.find('a').text().trim();
      const profileHref = playerBlock.find('a').attr('href') || '';
      const steamID = profileHref.split('/').pop() || '';
      const country =
        playerBlock
          .find('img[alt^="flag"]')
          .attr('alt')
          ?.replace(/^flag /, '') ?? 'Unknown';
      const time = timeBlock.text().trim();
      const date = dateBlock.text().trim();

      return { rank, name, steamID, country, time, date };
    });
  }

  private async scrapeInfo($: cheerio.CheerioAPI) {
    const infoBlocks = $('div.flex.justify-end.gap-1 > div');
    const tierText = infoBlocks.eq(0).text().trim();
    const stagesText = infoBlocks.eq(1).text().trim();
    const bonusesText = infoBlocks.eq(2).text().trim();

    const tier = parseInt(tierText.replace(/[^0-9]/g, ''), 10) || null;
    const stages = parseInt(stagesText.replace(/[^0-9]/g, ''), 10) || 0;
    const bonuses = parseInt(bonusesText.replace(/[^0-9]/g, ''), 10) || 0;

    return { tier, stages, bonuses };
  }

  private async scrapeMap(
    url: string,
    mapName: string,
    styleParam: string,
    fullList: boolean,
  ) {
    const $base = await this.fetchPage(url);

    const options = $base('nav select option')
      .map((_, el) => ({
        value: $base(el).attr('value'),
        label: $base(el).text().trim(),
      }))
      .toArray();

    const mapRecords: any[] = [];
    const stageRecords: Record<number, any[]> = {};
    const bonusesRecords: Record<string, any[]> = {};

    for (const opt of options) {
      const { value, label } = opt as any;
      if (!value) continue;

      let targetUrl = url;
      if (value !== '0') {
        targetUrl = `https://ksf.surf/maps/${mapName}?zone=${value}`;
        if (styleParam) targetUrl += `&mode=${styleParam}`;
      }

      try {
        const $page = value === '0' ? $base : await this.fetchPage(targetUrl);
        const top10 = this.scrapeTop10($page);
        if (!top10.length) continue;

        const records = fullList ? top10 : [top10[0]];

        if (value === '0') {
          mapRecords.push(...records);
        } else if (label.toLowerCase().includes('stage')) {
          const stageNumber = parseInt(label.replace(/\D/g, ''), 10);
          if (!isNaN(stageNumber)) {
            stageRecords[stageNumber] = records;
          }
        } else {
          const bonusNumber = parseInt(label.replace(/\D/g, ''), 10);
          if (!isNaN(bonusNumber)) {
            bonusesRecords[bonusNumber] = records;
          }
        }
      } catch {
        // ignore individual option errors
      }
    }

    return { mapRecords, stageRecords, bonusesRecords };
  }

  async getMap(mapName: string, fullList = false) {
    const key = `${mapName.toLowerCase()}_${fullList ? 'full' : 'top1'}`;
    const now = Date.now();

    if (this.cache[key] && now - this.cache[key].timestamp < this.CACHE_TTL) {
      return this.cache[key].data;
    }

    try {
      const baseUrl = `https://ksf.surf/maps/${mapName}`;
      const $base = await this.fetchPage(baseUrl);
      const info = await this.scrapeInfo($base);

      const styles = {
        forward: '',
        sideways: 'sw',
        halfsideways: 'hsw',
        backwards: 'bw',
      };

      const styleData: any = {};
      for (const [style, styleParam] of Object.entries(styles)) {
        styleData[style] = await this.scrapeMap(
          styleParam ? `${baseUrl}?mode=${styleParam}` : baseUrl,
          mapName,
          styleParam,
          fullList,
        );
      }

      const result = {
        map: mapName,
        ...info,
        styles: styleData,
      };

      this.cache[key] = { timestamp: now, data: result };
      return result;
    } catch (err: any) {
      throw new HttpException(
        `Scraping failed: ${err.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
