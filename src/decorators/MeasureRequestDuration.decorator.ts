import { performance } from 'perf_hooks';

export const MEASURE_REQUEST_DURATION = 'measureRequestDuration';

export const MeasureRequestDuration = () => {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = performance.now();
      const result = await originalMethod.apply(this, args);
      const endTime = performance.now();
      const durationMs = Math.round(endTime - startTime);

      if (typeof result === 'object' && result !== null) {
        return {
          ...result,
          durationMs,
        };
      }

      return result;
    };

    return descriptor;
  };
};
