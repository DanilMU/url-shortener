import { UrlCacheService, urlCacheService } from '../infra/cache/url.cache.service';
import { UrlRepository, urlRepository } from '../repositories/url.repository';

export class ClickBufferService {
	private timer: NodeJS.Timeout | null = null;
	private isFlushing = false;

	public constructor(
		private readonly cache: UrlCacheService = urlCacheService,
		private readonly repository: UrlRepository = urlRepository,
	) {}

	public start(intervalMs: number = 5000): void {
		if (this.timer) return;

		this.timer = setInterval(() => {
			this.flush().catch((err) => {
				console.error('❌ Error during scheduled click buffer flush:', err);
			});
		}, intervalMs);

		if (this.timer.unref) {
			this.timer.unref();
		}

		console.log(`⏱️ Click buffer scheduled flush enabled (every ${intervalMs}ms)`);
	}

	public stop(): void {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
			console.log('🛑 Click buffer flush timer stopped');
		}
	}

	public async flush(): Promise<number> {
		if (this.isFlushing) {
			return 0;
		}

		this.isFlushing = true;
		try {
			const snapshot = await this.cache.snapshotAndClearBuffer();
			const entries = Object.entries(snapshot).map(([code, delta]) => ({
				code,
				delta,
			}));

			if (entries.length === 0) {
				return 0;
			}

			let updatedCodes: string[] = [];
			try {
				updatedCodes = await this.repository.batchIncrementClicks(entries);
			} catch (dbError) {
				console.error('⚠️ DB failure during batch click flush, restoring buffer:', dbError);
				await this.cache.restoreBuffer(snapshot);
				throw dbError;
			}

			// Проверка на stale cache: если запись удалена из БД, чистим Redis кеш
			const updatedSet = new Set(updatedCodes);
			for (const entry of entries) {
				if (!updatedSet.has(entry.code)) {
					console.warn(
						`⚠️ [ClickBuffer] Short code "${entry.code}" not found in DB. Cleaning up stale Redis cache.`,
					);
					await this.cache.invalidate(entry.code).catch(() => {});
				}
			}

			await this.cache.clearProcessingBuffer();

			const totalClicks = entries.reduce((acc, curr) => acc + curr.delta, 0);
			console.log(
				`📊 Flushed ${totalClicks} buffered clicks across ${entries.length} URLs to PostgreSQL`,
			);
			return totalClicks;
		} finally {
			this.isFlushing = false;
		}
	}
}

export const clickBufferService = new ClickBufferService();
