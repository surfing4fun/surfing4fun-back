import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { APIEmbed, TextChannel, Message } from 'discord.js';

import { DiscordLoggerService } from './discord-logger.service';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsDashboardService implements OnModuleInit {
  private readonly logger = new Logger(MetricsDashboardService.name);
  private dashboardMessageId: string | null = null;

  constructor(
    private readonly metrics: MetricsService,
    private readonly discord: DiscordLoggerService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.dashboardMessageId = null;
    await this.updateDashboard(true);
  }

  @Cron('0 * * * * *')
  async handleMinuteSummary(): Promise<void> {
    await this.updateDashboard(false);
  }

  @Cron('0 0 * * * *')
  async handleHourlyRotation(): Promise<void> {
    this.logger.log('Hourly rotation: creating new dashboard message');
    this.dashboardMessageId = null;
    await this.updateDashboard(true);
  }

  private async updateDashboard(resetCounters: boolean): Promise<void> {
    const channel = (this.discord as any).metricsChannel as
      | TextChannel
      | undefined;
    if (!channel?.isTextBased()) {
      this.logger.warn('Metrics channel not ready, skipping update');
      return;
    }
    const snap = this.metrics.snapshot();
    const total = snap.totalRequests;
    const errRate = total ? snap.errorCount / total : 0;

    const fields = [
      { name: 'RPM', value: `${this.metrics.getThroughput()}`, inline: true },
      {
        name: 'Errors (%)',
        value: `${(errRate * 100).toFixed(2)}%`,
        inline: true,
      },
      {
        name: 'P95 Latency',
        value: `${this.metrics.getPercentile(95)}ms`,
        inline: true,
      },
      {
        name: 'P99 Latency',
        value: `${this.metrics.getPercentile(99)}ms`,
        inline: true,
      },
      {
        name: 'Apdex',
        value: this.metrics.getApdex(200).toFixed(2),
        inline: true,
      },

      { name: 'CPU %', value: `${snap.cpuPercent.toFixed(1)}%`, inline: true },
      { name: 'Memory MB', value: `${snap.memMb}`, inline: true },
      {
        name: 'Cache Hit %',
        value: `${(snap.cacheHitRatio * 100).toFixed(1)}%`,
        inline: true,
      },

      { name: 'DB P95', value: `${snap.dbP95}ms`, inline: true },
      { name: 'Ext P95', value: `${snap.extP95}ms`, inline: true },
      { name: 'Warn Logs', value: `${snap.warnCount}`, inline: true },
      { name: 'Error Logs', value: `${snap.errorLogCount}`, inline: true },

      ...snap.slowest.map((s, i) => ({
        name: `Slow${i + 1}`,
        value: `\`${s.path}\`: ${s.time}ms`,
        inline: false,
      })),
    ];

    const raw: APIEmbed = {
      title: '🚀 API KPI Summary (last interval)',
      color: 0x00aeff,
      fields,
      timestamp: new Date().toISOString(),
      footer: { text: 'Surfing4Fun API Observability' },
    };

    try {
      if (this.dashboardMessageId) {
        const msg = await channel.messages.fetch(this.dashboardMessageId);
        await msg.edit({ embeds: [raw] });
      } else {
        const msg = await channel.send({ embeds: [raw] });
        this.dashboardMessageId = (msg as Message).id;
      }
      if (resetCounters) this.metrics.reset();
    } catch (err) {
      this.logger.error(
        'Dashboard update failed; will retry',
        (err as Error).stack,
      );
      this.dashboardMessageId = null;
    }
  }
}
