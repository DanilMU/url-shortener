import { nanoid } from 'nanoid';
import { env } from '../config/env';
import { BadRequestError, ConflictError, NotFoundError } from '../errors/app.error';
import { UrlCacheService, urlCacheService } from '../infra/cache/url.cache.service';
import { UrlEntity, UrlRepository, urlRepository } from '../repositories/url.repository';

export interface ShortenResult extends UrlEntity {
	shortUrl: string;
}

export class UrlService {
	public constructor(
		private readonly repository: UrlRepository = urlRepository,
		private readonly cache: UrlCacheService = urlCacheService,
	) {}

	public async shortenUrl(originalUrl: string, customCode?: string): Promise<ShortenResult> {
		this.validateOriginalUrl(originalUrl);

		let shortCode: string;

		if (customCode) {
			const sanitizedCode = customCode.trim();
			this.validateCustomCode(sanitizedCode);

			const exists = await this.repository.existsByShortCode(sanitizedCode);
			if (exists) {
				throw new ConflictError(`Short code "${sanitizedCode}" is already taken`);
			}
			shortCode = sanitizedCode;
		} else {
			shortCode = await this.generateUniqueShortCode();
		}

		const entity = await this.repository.create({
			shortCode,
			originalUrl,
		});

		await this.cache.setUrl(shortCode, originalUrl);

		return {
			...entity,
			shortUrl: `${env.BASE_URL}/${entity.short_code}`,
		};
	}

	public async resolveUrl(shortCode: string): Promise<string> {
		const cachedUrl = await this.cache.getUrl(shortCode);

		if (cachedUrl) {
			this.repository.incrementClicks(shortCode).catch((err) => {
				console.error(`⚠️ Failed to increment clicks for ${shortCode}:`, err);
			});
			return cachedUrl;
		}

		const entity = await this.repository.findByShortCode(shortCode);
		if (!entity) {
			throw new NotFoundError(`Short URL with code "${shortCode}" not found`);
		}

		await this.cache.setUrl(shortCode, entity.original_url);

		this.repository.incrementClicks(shortCode).catch((err) => {
			console.error(`⚠️ Failed to increment clicks for ${shortCode}:`, err);
		});

		return entity.original_url;
	}

	public async getStats(shortCode: string): Promise<ShortenResult> {
		const entity = await this.repository.findByShortCode(shortCode);
		if (!entity) {
			throw new NotFoundError(`Short URL with code "${shortCode}" not found`);
		}

		return {
			...entity,
			shortUrl: `${env.BASE_URL}/${entity.short_code}`,
		};
	}

	public async getRecentUrls(limit: number = 20): Promise<ShortenResult[]> {
		const urls = await this.repository.getRecent(limit);
		return urls.map((u) => ({
			...u,
			shortUrl: `${env.BASE_URL}/${u.short_code}`,
		}));
	}

	private validateOriginalUrl(urlString: string): void {
		let parsedUrl: URL;
		try {
			parsedUrl = new URL(urlString);
		} catch {
			throw new BadRequestError('Invalid URL format');
		}

		if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
			throw new BadRequestError('URL protocol must be http or https');
		}

		const hostname = parsedUrl.hostname.toLowerCase();
		if (
			hostname === 'localhost' ||
			hostname === '127.0.0.1' ||
			hostname === '::1'
		) {
			throw new BadRequestError('Shortening localhost or loopback addresses is not permitted');
		}

		try {
			const baseUrlParsed = new URL(env.BASE_URL);
			if (hostname === baseUrlParsed.hostname.toLowerCase()) {
				throw new BadRequestError('Shortening links to this service is not permitted');
			}
		} catch {
			// No-op
		}
	}

	private validateCustomCode(code: string): void {
		if (code.length < 3 || code.length > 20) {
			throw new BadRequestError('Custom code length must be between 3 and 20 characters');
		}
		const validRegex = /^[a-zA-Z0-9_-]+$/;
		if (!validRegex.test(code)) {
			throw new BadRequestError('Custom code can only contain letters, numbers, underscores, and hyphens');
		}
	}

	private async generateUniqueShortCode(maxAttempts: number = 5): Promise<string> {
		for (let attempt = 1; attempt <= maxAttempts; attempt++) {
			const code = nanoid(6);
			const exists = await this.repository.existsByShortCode(code);
			if (!exists) {
				return code;
			}
		}
		throw new Error('Failed to generate unique short code after maximum retries');
	}
}

export const urlService = new UrlService();
