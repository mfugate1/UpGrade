import Container from 'typedi';
import { MetricService } from '../../api/services/MetricService';
import { env } from '../../env';

export function InitMetrics(): Promise<any> {
  const metricService: MetricService = Container.get(MetricService);
  // Init default metrics in system
  if (env.initialization.metrics) {
  return metricService.saveAllMetrics(env.initialization.metrics);
  }
  return Promise.resolve();
}
