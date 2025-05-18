import * as os from 'os';

import { Injectable } from '@nestjs/common';

interface ILatencyRecord {
  count: number;
  totalMs: number;
  buckets: number[];
  topFiveSlowestRequests: { path: string; time: number }[];
}

@Injectable()
export class MetricsService {
  private totalRequests = 0;
  private errorCount = 0;
  private latency: ILatencyRecord = {
    count: 0,
    totalMs: 0,
    buckets: [],
    topFiveSlowestRequests: [],
  };
  private startTime = Date.now();

  private lastCpuUsage = process.cpuUsage();
  private lastHrtime = process.hrtime();

  private warnCount = 0;
  private errorLogCount = 0;

  private cacheHits = 0;
  private cacheMisses = 0;

  private dbLatencies: number[] = [];
  private extLatencies: number[] = [];

  /** Record an HTTP request’s latency and error status */
  recordRequest(path: string, durationMs: number, isError = false) {
    this.totalRequests++;
    if (isError) this.errorCount++;
    this.latency.count++;
    this.latency.totalMs += durationMs;
    this.latency.buckets.push(durationMs);

    // Only consider requests slower than threshold
    const threshold = 100; // ms
    if (durationMs > threshold) {
      this.latency.topFiveSlowestRequests.push({ path, time: durationMs });
      this.latency.topFiveSlowestRequests.sort((a, b) => b.time - a.time);
      if (this.latency.topFiveSlowestRequests.length > 5) {
        this.latency.topFiveSlowestRequests.pop();
      }
    }
  }

  recordLog(level: 'warn' | 'error') {
    if (level === 'warn') this.warnCount++;
    else this.errorLogCount++;
  }

  recordCacheHit() {
    this.cacheHits++;
  }
  recordCacheMiss() {
    this.cacheMisses++;
  }
  getCacheHitRatio(): number {
    const total = this.cacheHits + this.cacheMisses;
    return total === 0 ? 0 : this.cacheHits / total;
  }

  recordDbLatency(ms: number) {
    this.dbLatencies.push(ms);
  }
  getDbP95(): number {
    const sorted = [...this.dbLatencies].sort((a, b) => a - b);
    const idx = Math.ceil(0.95 * sorted.length) - 1;
    return sorted[Math.max(0, idx)] || 0;
  }

  recordExtLatency(ms: number) {
    this.extLatencies.push(ms);
  }
  getExtP95(): number {
    const sorted = [...this.extLatencies].sort((a, b) => a - b);
    const idx = Math.ceil(0.95 * sorted.length) - 1;
    return sorted[Math.max(0, idx)] || 0;
  }

  getCpuUsagePercent(): number {
    const deltaUsage = process.cpuUsage(this.lastCpuUsage);
    const deltaHr = process.hrtime(this.lastHrtime);
    const elapsedMs = deltaHr[0] * 1000 + deltaHr[1] / 1e6;
    const cpuMs = (deltaUsage.user + deltaUsage.system) / 1000;
    const rawPct = elapsedMs ? (cpuMs / elapsedMs) * 100 : 0;
    const pct = rawPct / (os.cpus().length || 1);
    this.lastCpuUsage = process.cpuUsage();
    this.lastHrtime = process.hrtime();
    return Math.min(100, Math.max(0, pct));
  }

  getMemoryUsageMb(): number {
    return Math.round(process.memoryUsage().rss / 1024 / 1024);
  }

  getThroughput(): number {
    const mins = (Date.now() - this.startTime) / 60000;
    return Math.round(this.totalRequests / (mins || 1));
  }

  getErrorRate(): number {
    return this.totalRequests ? this.errorCount / this.totalRequests : 0;
  }

  getPercentile(p: number): number {
    const sorted = [...this.latency.buckets].sort((a, b) => a - b);
    const idx = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, idx)] || 0;
  }

  getApdex(thresholdMs: number): number {
    const b = this.latency.buckets;
    const sat = b.filter((d) => d <= thresholdMs).length;
    const fru = b.filter((d) => d > thresholdMs * 4).length;
    const tol = b.length - sat - fru;
    return (sat + tol / 2) / Math.max(1, b.length);
  }

  reset() {
    this.totalRequests = 0;
    this.errorCount = 0;
    this.latency = {
      count: 0,
      totalMs: 0,
      buckets: [],
      topFiveSlowestRequests: [],
    };
    this.startTime = Date.now();
    this.lastCpuUsage = process.cpuUsage();
    this.lastHrtime = process.hrtime();
    this.warnCount = 0;
    this.errorLogCount = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.dbLatencies = [];
    this.extLatencies = [];
  }

  snapshot() {
    return {
      totalRequests: this.totalRequests,
      errorCount: this.errorCount,
      warnCount: this.warnCount,
      errorLogCount: this.errorLogCount,
      cacheHitRatio: this.getCacheHitRatio(),
      dbP95: this.getDbP95(),
      extP95: this.getExtP95(),
      cpuPercent: this.getCpuUsagePercent(),
      memMb: this.getMemoryUsageMb(),
      slowest: this.latency.topFiveSlowestRequests,
    };
  }
}
