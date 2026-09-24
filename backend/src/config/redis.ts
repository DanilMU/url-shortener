import Redis from 'ioredis';
import { env } from './env';

export class RedisService extends Redis {
	public constructor() {
		super({
			host: env.REDIS_HOST,
			port: env.REDIS_PORT,
			password: env.REDIS_PASSWORD || undefined,
			maxRetriesPerRequest: 5,
			enableOfflineQueue: true,
			lazyConnect: true,
			keepAlive: 10000,
			family: 4,
			retryStrategy: (times) => Math.min(times * 100, 3000),
		});

		this.registerEvents();
	}

	private registerEvents(): void {
		let connectStart = Date.now();

		this.on('connect', () => {
			connectStart = Date.now();
			console.log('🔄 Redis connecting...');
		});

		this.on('ready', () => {
			const ms = Date.now() - connectStart;
			console.log(`✅ Redis ready in ${ms}ms (${env.REDIS_HOST}:${env.REDIS_PORT})`);
		});

		this.on('error', (error) => {
			console.error('❌ Redis error:', error.message ?? error);
		});

		this.on('close', () => {
			console.warn('⚠️ Redis connection closed');
		});

		this.on('reconnecting', (delay: number) => {
			console.log(`🔄 Redis reconnecting in ${delay}ms...`);
		});
	}

	public async init(): Promise<void> {
		try {
			await this.connect();
			await this.ping();
		} catch (error) {
			console.error('❌ Failed to connect to Redis:', error);
			throw error;
		}
	}

	public async getJson<T>(key: string): Promise<T | null> {
		const value = await this.get(key);
		if (!value) return null;
		try {
			return JSON.parse(value) as T;
		} catch {
			return null;
		}
	}

	public async setJson(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
		const payload = JSON.stringify(value);
		if (ttlSeconds) {
			await this.set(key, payload, 'EX', ttlSeconds);
		} else {
			await this.set(key, payload);
		}
	}

	public async deleteKey(key: string): Promise<void> {
		await this.del(key);
	}

	public async close(): Promise<void> {
		console.log('🔄 Closing Redis connection...');
		try {
			await this.quit();
			console.log('✅ Redis connection closed successfully');
		} catch (error) {
			console.error('❌ Error closing Redis connection:', error);
		}
	}
}

export const redis = new RedisService();
