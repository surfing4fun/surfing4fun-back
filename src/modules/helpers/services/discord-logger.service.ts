/* eslint-disable no-console */
import { Injectable, LoggerService } from '@nestjs/common';
import { Client, TextChannel, GatewayIntentBits, APIEmbed } from 'discord.js';

import { MetricsService } from './metrics.service';

export interface IErrorEmbedOptions {
  title: string;
  description: string;
  httpStatus: number;
  params?: Record<string, any>;
  query?: Record<string, any>;
  body?: Record<string, any>;
  clientIp: string;
  userAgent: string;
  requestId?: string;
  userId?: string;
  featureFlags?: string[];
  commitSha?: string;
  environment?: string;
  hostname?: string;
  cpuUsage?: string;
  memoryUsage?: string;
  traceId?: string;
  spanId?: string;
  stack?: string;
}

@Injectable()
export class DiscordLoggerService implements LoggerService {
  private client: Client;
  private logChannel?: TextChannel;
  private errorChannel?: TextChannel;
  private metricsChannel?: TextChannel;

  // Fallback to console directly to avoid Nest Logger recursion
  private readonly fallback = {
    log: console.log.bind(console, '[DiscordLoggerService]'),
    warn: console.warn.bind(console, '[DiscordLoggerService]'),
    error: console.error.bind(console, '[DiscordLoggerService]'),
    debug: console.debug.bind(console, '[DiscordLoggerService]'),
    verbose: console.log.bind(console, '[DiscordLoggerService][VERBOSE]'),
  };

  private readonly LOG_ID = process.env.DISCORD_LOGS_CHANNEL_ID!;
  private readonly ERR_ID = process.env.DISCORD_ERRORS_CHANNEL_ID!;
  private readonly METRICS_ID = process.env.DISCORD_METRICS_CHANNEL_ID!;

  constructor(private readonly metrics: MetricsService) {
    this.client = new Client({ intents: [GatewayIntentBits.Guilds] });
    this.client.login(process.env.DISCORD_API_TOKEN);
    this.client.once('ready', async () => {
      this.fallback.log('Discord client ready; fetching channels...');
      try {
        this.logChannel = (await this.client.channels.fetch(
          this.LOG_ID,
        )) as TextChannel;
        this.errorChannel = (await this.client.channels.fetch(
          this.ERR_ID,
        )) as TextChannel;
        this.metricsChannel = (await this.client.channels.fetch(
          this.METRICS_ID,
        )) as TextChannel;
        this.fallback.log('Discord channels fetched successfully');
      } catch (err) {
        this.fallback.error(
          'Failed to fetch Discord channels',
          (err as Error).stack,
        );
      }
    });
  }

  // ─── PUBLIC: send a log‐level embed ─────────────────────────────────────────

  /**
   * Send an embed message to the log channel.
   * @param title   Embed title
   * @param desc    Embed description
   * @param color   Embed color (default 0x00aeff)
   */
  sendLogEmbed(title: string, desc: string, color = 0x00aeff) {
    const raw = this.buildRawEmbed(title, color, desc);
    this.safeSendRaw(this.logChannel, raw, () =>
      this.fallback.log(`${title} – ${desc}`),
    );
  }

  // ─── PUBLIC: send a structured warn embed ─────────────────────────────────────
  sendWarnEmbed(title: string, desc: string) {
    this.metrics.recordLog('warn');

    const raw: APIEmbed = this.buildRawEmbed(title, 0xffa500, desc);
    this.safeSendRaw(this.logChannel, raw, () =>
      console.warn(`${title} – ${desc}`),
    );
  }
  // ─── PUBLIC: send a structured error embed ─────────────────────────────────

  /**
   * Send a richly‐formatted error embed to the error channel.
   * @param opts  Detailed error options
   */
  sendErrorEmbedOptions(opts: IErrorEmbedOptions) {
    this.metrics.recordLog('error');
    const fields = [
      { name: 'Status', value: `${opts.httpStatus}`, inline: true },
      { name: 'Client IP', value: opts.clientIp, inline: true },
      { name: 'User-Agent', value: opts.userAgent, inline: false },
      ...(opts.requestId
        ? [{ name: 'Request ID', value: opts.requestId, inline: true }]
        : []),
      ...(opts.userId
        ? [{ name: 'User ID', value: opts.userId, inline: true }]
        : []),
      ...(opts.featureFlags
        ? [
            {
              name: 'Flags',
              value: opts.featureFlags.join(', '),
              inline: false,
            },
          ]
        : []),
      ...(opts.params
        ? [
            {
              name: 'Route Params',
              value: '```json\n' + JSON.stringify(opts.params) + '\n```',
            },
          ]
        : []),
      ...(opts.query
        ? [
            {
              name: 'Query Params',
              value: '```json\n' + JSON.stringify(opts.query) + '\n```',
            },
          ]
        : []),
      ...(opts.body
        ? [
            {
              name: 'Request Body',
              value: '```json\n' + JSON.stringify(opts.body) + '\n```',
            },
          ]
        : []),
      ...(opts.hostname
        ? [{ name: 'Host', value: opts.hostname, inline: true }]
        : []),
      ...(opts.environment
        ? [{ name: 'Env', value: opts.environment, inline: true }]
        : []),
      ...(opts.commitSha
        ? [{ name: 'Commit', value: opts.commitSha, inline: false }]
        : []),
      ...(opts.cpuUsage
        ? [{ name: 'CPU Usage', value: opts.cpuUsage, inline: true }]
        : []),
      ...(opts.memoryUsage
        ? [{ name: 'Memory Usage', value: opts.memoryUsage, inline: true }]
        : []),
      ...(opts.traceId
        ? [{ name: 'Trace ID', value: opts.traceId, inline: true }]
        : []),
      ...(opts.spanId
        ? [{ name: 'Span ID', value: opts.spanId, inline: true }]
        : []),
      ...(opts.stack
        ? [
            {
              name: 'Stack Trace',
              value: '```' + opts.stack.substring(0, 1024) + '```',
            },
          ]
        : []),
    ];

    const raw: APIEmbed = {
      title: opts.title,
      description: opts.description,
      color: 0xff0000,
      fields,
      timestamp: new Date().toISOString(),
    };

    this.safeSendRaw(this.errorChannel, raw, () =>
      this.fallback.error(`${opts.title} – ${opts.description}`, opts.stack),
    );
  }

  // ─── EXISTING: LoggerService methods (no‐ops) ──────────────────────────────

  log = () => {};
  error = () => {};
  warn = () => {};
  debug = () => {};
  verbose = () => {};

  // ─── METRICS CHANNEL ───────────────────────────────────────────────────────

  metric(message: string) {
    if (this.metricsChannel?.isTextBased()) {
      this.metricsChannel
        .send({ content: `📊 **Metric:** ${message}` })
        .catch((err) =>
          this.fallback.error(
            'Discord metric send error',
            (err as Error).stack,
          ),
        );
    } else {
      this.fallback.log(`[METRIC] ${message}`);
    }
  }

  createMetricsEmbed(method: string, url: string, ms: number, total: number) {
    const raw: APIEmbed = {
      title: '🌐 API Request',
      fields: [
        { name: 'Method', value: method, inline: true },
        { name: 'Endpoint', value: url, inline: true },
        { name: 'Duration (ms)', value: `${ms}`, inline: true },
        { name: 'Total Requests', value: `${total}`, inline: true },
      ],
      timestamp: new Date().toISOString(),
      footer: { text: 'Surfing4Fun Observability' },
    };
    return raw;
  }

  sendMetricsEmbed(raw: APIEmbed) {
    if (this.metricsChannel?.isTextBased()) {
      this.metricsChannel
        .send({ embeds: [raw] as any })
        .catch((err) =>
          this.fallback.error(
            'Discord metrics embed send error',
            (err as Error).stack,
          ),
        );
    } else {
      this.fallback.log('[METRICS EMBED] ' + JSON.stringify(raw));
    }
  }

  // ─── PRIVATE HELPERS ───────────────────────────────────────────────────────

  private buildRawEmbed(
    title: string,
    color: number,
    description: string,
    trace?: string,
  ): APIEmbed {
    const fields = trace
      ? [{ name: 'Stack Trace', value: `\`\`\`${trace}\`\`\`` }]
      : [];
    return {
      title,
      description,
      color,
      fields,
      timestamp: new Date().toISOString(),
    };
  }

  private safeSendRaw(
    channel: TextChannel | undefined,
    raw: APIEmbed,
    fallback: () => void,
  ) {
    if (channel?.isTextBased()) {
      channel.send({ embeds: [raw] as any }).catch((err) => {
        this.fallback.error('Discord send error', (err as Error).stack);
        fallback();
      });
    } else {
      fallback();
    }
  }
}
