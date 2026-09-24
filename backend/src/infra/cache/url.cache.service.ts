import { env } from '../../config/env';
import { redis, RedisService } from '../../config/redis';
import { UrlCacheKeys } from './url.cache.keys';

export class UrlCacheService {
	private readonly defaultTtl: number;

	public constructor(private readonly redisClient: RedisService = redis) {
		this.defaultTtl = env.REDIS_TTL_SECONDS;
	}

	public async getUrl(shortCode: string): Promise<string | null> {
		const key = UrlCacheKeys.byShortCode(shortCode);
		return this.redisClient.get(key);
	}

	public async setUrl(shortCode: string, originalUrl: string, ttl: number = this.defaultTtl): Promise<void> {
		const key = UrlCacheKeys.byShortCode(shortCode);
		await this.redisClient.set(key, originalUrl, 'EX', ttl);
	}

	public async invalidate(shortCode: string): Promise<void> {
		const key = UrlCacheKeys.byShortCode(shortCode);
		await this.redisClient.deleteKey(key);
	}
}

export const urlCacheService = new UrlCacheService();
