import axios from 'axios';

import { MetricsService } from '../modules/helpers/services/metrics.service';

export function createAxiosWithMetrics(metrics: MetricsService) {
  const api = axios.create({
    baseURL: process.env.EXTERNAL_API_URL,
    timeout: 5000,
  });

  api.interceptors.request.use((config) => {
    (config as any).metadata = { startTime: Date.now() };
    return config;
  });

  api.interceptors.response.use(
    (response) => {
      const duration = Date.now() - (response.config as any).metadata.startTime;
      metrics.recordExtLatency(duration);
      return response;
    },
    (error) => {
      if (error.config?.metadata) {
        const duration = Date.now() - error.config.metadata.startTime;
        metrics.recordExtLatency(duration);
      }
      return Promise.reject(error);
    },
  );

  return api;
}
