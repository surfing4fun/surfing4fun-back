import axios, { AxiosInstance } from 'axios';

import { MetricsService } from '../services/metrics.service';

export function createAxios(metrics: MetricsService): AxiosInstance {
  const instance = axios.create({
    baseURL: process.env.EXTERNAL_API_URL,
    timeout: 10_000,
  });

  // Attach metadata for timing
  instance.interceptors.request.use((config) => {
    (config as any).metadata = { startTime: Date.now() };
    return config;
  });

  // Record duration on response
  instance.interceptors.response.use(
    (response) => {
      const start = (response.config as any).metadata.startTime;
      const duration = Date.now() - start;
      metrics.recordExtLatency(duration);
      return response;
    },
    (error) => {
      if (error.config?.metadata) {
        const start = error.config.metadata.startTime;
        const duration = Date.now() - start;
        metrics.recordExtLatency(duration);
      }
      return Promise.reject(error);
    },
  );

  return instance;
}
