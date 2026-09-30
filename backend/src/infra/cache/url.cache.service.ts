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

	public async incrementBufferedClicks(shortCode: string, count: number = 1): Promise<number> {
		return this.redisClient.hincrby(UrlCacheKeys.clicksBuffer, shortCode, count);
	}

	public async getBufferedClicks(shortCode: string): Promise<number> {
		const val = await this.redisClient.hget(UrlCacheKeys.clicksBuffer, shortCode);
		return val ? parseInt(val, 10) || 0 : 0;
	}

	public async snapshotAndClearBuffer(): Promise<Record<string, number>> {
		try {
			await this.redisClient.rename(UrlCacheKeys.clicksBuffer, UrlCacheKeys.clicksProcessing);
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : String(err);
			if (message.includes('no such key')) {
				return {};
			}
			throw err;
		}

		const raw = await this.redisClient.hgetall(UrlCacheKeys.clicksProcessing);
		const result: Record<string, number> = {};
		for (const [code, val] of Object.entries(raw)) {
			const parsed = parseInt(val, 10);
			if (parsed > 0) {
				result[code] = parsed;
			}
		}
		return result;
	}

	public async clearProcessingBuffer(): Promise<void> {
		await this.redisClient.del(UrlCacheKeys.clicksProcessing);
	}

	public async restoreBuffer(entries: Record<string, number>): Promise<void> {
		const pipeline = this.redisClient.pipeline();
		for (const [code, count] of Object.entries(entries)) {
			if (count > 0) {
				pipeline.hincrby(UrlCacheKeys.clicksBuffer, code, count);
			}
		}
		await pipeline.exec();
		await this.clearProcessingBuffer();
	}
}

export const urlCacheService = new UrlCacheService();
