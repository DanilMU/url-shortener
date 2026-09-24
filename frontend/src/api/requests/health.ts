import type { HealthResponse } from '../generated';
import { instance } from '../instance';

export const getHealthStatus = (): Promise<HealthResponse> =>
	instance.get<HealthResponse>('/health').then((res) => res.data);
