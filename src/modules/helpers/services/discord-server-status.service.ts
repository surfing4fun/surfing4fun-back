// src/modules/helpers/services/discord-server-status.service.ts

import {
  Injectable,
  OnModuleInit,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WebhookClient, APIEmbed, RESTJSONErrorCodes } from 'discord.js';
import { CountryFlagService } from 'src/modules/api/country-flag/country-flag.service';
import { ServerHealthService } from 'src/modules/api/server-health/server-health.service';

interface IServerInfo {
  name: string;
  address: string;
  map: string;
  players: string;
  bots: number;
  serverType: string;
  environment: string;
  visibility: string;
  vac: string;
  version: string;
}

@Injectable()
export class DiscordServerStatusService implements OnModuleInit {
  private readonly logger = new Logger(DiscordServerStatusService.name);
  private webhook: WebhookClient;
  private messageId?: string;

  private readonly WEBHOOK_URL = process.env.DISCORD_SERVER_STATUS_WEBHOOK!;
  private readonly INITIAL_MESSAGE_ID =
    process.env.DISCORD_SERVER_STATUS_MESSAGE_ID;
  private readonly SERVER_IP = process.env.SERVER_IP!;

  // parse only digits, filter out NaN
  private readonly PORTS =
    (process.env.SERVER_PORTS || '')
      .match(/\d+/g)
      ?.map(Number)
      .filter((n) => !isNaN(n)) ?? [];

  /** Keep last‐seen info for each port */
  private lastInfo = new Map<number, IServerInfo>();

  constructor(
    private readonly health: ServerHealthService,
    private readonly countryFlagService: CountryFlagService,
  ) {
    if (!this.WEBHOOK_URL) {
      throw new InternalServerErrorException(
        'Missing DISCORD_SERVER_STATUS_WEBHOOK',
      );
    }
    this.webhook = new WebhookClient({ url: this.WEBHOOK_URL });
    this.messageId = this.INITIAL_MESSAGE_ID;
  }

  async onModuleInit() {
    await this.refreshStatus();
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  private async refreshStatus(): Promise<void> {
    let snapshot;
    try {
      snapshot = await this.health.getHealthCheck();
    } catch (err) {
      this.logger.error('Health check failed', (err as Error).stack);
      return;
    }

    // build all embeds in parallel (so buildEmbed can await country lookups)
    const embeds: APIEmbed[] = await Promise.all(
      this.PORTS.map(async (port) => {
        const info = snapshot.servers.find((s) =>
          s.address.endsWith(`:${port}`),
        );
        if (info) {
          this.lastInfo.set(port, info);
          return this.buildEmbed(info, snapshot.timestamp);
        } else {
          return this.buildOfflineEmbed(port, snapshot.timestamp);
        }
      }),
    );

    // try editing existing message
    if (this.messageId) {
      try {
        await this.webhook.editMessage(this.messageId, { embeds });
        this.logger.log('Edited status message');
        return;
      } catch (err: any) {
        if (err.code !== RESTJSONErrorCodes.UnknownMessage) {
          this.logger.error('Failed to edit status message', err.stack);
          return;
        }
        this.logger.warn('Stored message not found, sending a new one');
      }
    }

    // fallback: send new
    try {
      const msg = await this.webhook.send({ embeds });
      this.messageId = msg.id;
      this.logger.log('Sent new status message, id=' + msg.id);
    } catch (err) {
      this.logger.error('Failed to send status message', (err as Error).stack);
    }
  }

  private async buildEmbed(
    info: IServerInfo,
    timestamp: Date,
  ): Promise<APIEmbed> {
    const [host, port] = info.address.split(':');
    const [onlineStr, maxStr] = info.players.split('/');
    const online = Number(onlineStr);
    const max = Number(maxStr) || 1;
    const pct = Math.round((online / max) * 100);

    let countryCode: string | null = null;
    let flag: string | null = null;
    try {
      countryCode = await this.countryFlagService.getCountryCodeByIp(host);
      flag = `:flag_${countryCode.toLowerCase()}:`;
    } catch {
      // ignore
    }

    const fields = [
      { name: 'Status', value: '🟢 Online', inline: true },
      { name: 'Address', value: `${this.SERVER_IP}:${port}`, inline: true },
      {
        name: 'Country',
        value: countryCode
          ? `${flag ? `${flag} ` : ''}${countryCode}`
          : 'Unknown',
        inline: true,
      },
      { name: 'Map', value: info.map, inline: true },
      {
        name: 'Players',
        value: `${online - info.bots}/${max} (${pct}%)`,
        inline: true,
      },
      { name: 'Bots', value: `${info.bots}`, inline: true },
      { name: 'Type', value: info.serverType, inline: true },
      { name: 'OS', value: info.environment, inline: true },
      { name: 'Visibility', value: info.visibility, inline: true },
      { name: 'VAC', value: info.vac, inline: true },
      { name: 'Version', value: info.version, inline: true },
    ];

    return {
      title: info.name,
      description: `Connect: steam://connect/${host}:${port}`,
      color: 0x00b300,
      fields,
      footer: {
        text: `Surfing4Fun - API - Server Status - Updated: ${timestamp.toLocaleString()}`,
      },
      timestamp: timestamp.toISOString(),
      image: {
        url: `https://i.ibb.co/RqM1cjY/New-Project.png`,
      },
    };
  }

  private buildOfflineEmbed(port: number, timestamp: Date): APIEmbed {
    const last = this.lastInfo.get(port);
    const fields = [
      { name: 'Status', value: '🔴 Offline', inline: true },
      {
        name: 'Address',
        value: `\`${this.SERVER_IP}:${port}\``,
        inline: true,
      },
      {
        name: 'Map',
        value: last?.map ?? 'none',
        inline: true,
      },
      { name: 'Players', value: '0', inline: true },
      { name: 'Bots', value: '0', inline: true },
      {
        name: 'Type',
        value: last?.serverType ?? 'unknown',
        inline: true,
      },
      {
        name: 'OS',
        value: last?.environment ?? 'unknown',
        inline: true,
      },
      {
        name: 'Visibility',
        value: last?.visibility ?? 'unknown',
        inline: true,
      },
      {
        name: 'VAC',
        value: last?.vac ?? 'unknown',
        inline: true,
      },
      {
        name: 'Version',
        value: last?.version ?? 'unknown',
        inline: true,
      },
    ];

    return {
      title: last?.name ?? `Server :${port}`,
      description: 'No response (offline)',
      color: 0x808080,
      fields,
      footer: { text: `Updated: ${timestamp.toLocaleString()}` },
      timestamp: timestamp.toISOString(),
    };
  }
}
