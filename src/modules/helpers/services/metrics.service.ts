import { Injectable } from '@nestjs/common';

interface LatencyRecord {
  count: number;
  totalMs: number;
  buckets: number[];
}

@Injectable()
export class MetricsService {
  private totalRequests = 0;
  private errorCount = 0;
  private latency: LatencyRecord = { count: 0, totalMs: 0, buckets: [] };
  private startTime = Date.now();

  recordRequest(durationMs: number, isError = false) {
    this.totalRequests++;
    if (isError) this.errorCount++;
    this.latency.count++;
    this.latency.totalMs += durationMs;
    this.latency.buckets.push(durationMs);
  }

  getThroughput(): number {
    const minutes = (Date.now() - this.startTime) / 60000;
    return Math.round(this.totalRequests / minutes);
  }

  getErrorRate(): number {
    return this.totalRequests === 0 ? 0 : this.errorCount / this.totalRequests;
  }

  getPercentile(p: number): number {
    const sorted = [...this.latency.buckets].sort((a, b) => a - b);
    const idx = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, idx)] || 0;
  }

  getApdex(thresholdMs: number): number {
    const satisfied = this.latency.buckets.filter(
      (d) => d <= thresholdMs,
    ).length;
    const frustrated = this.latency.buckets.filter(
      (d) => d > thresholdMs * 4,
    ).length;
    const tolerated = this.latency.buckets.length - satisfied - frustrated;
    return (
      (satisfied + tolerated / 2) / Math.max(1, this.latency.buckets.length)
    );
  }

  reset() {
    this.totalRequests = 0;
    this.errorCount = 0;
    this.latency = { count: 0, totalMs: 0, buckets: [] };
    this.startTime = Date.now();
  }
}
