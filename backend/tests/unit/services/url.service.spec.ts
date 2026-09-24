import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestError, ConflictError, NotFoundError } from '../../../src/errors/app.error';
import { UrlCacheService } from '../../../src/infra/cache/url.cache.service';
import { UrlRepository } from '../../../src/repositories/url.repository';
import { UrlService } from '../../../src/services/url.service';
import { createUrlFixture } from '../../fixtures/url.fixture';

describe('UrlService (Unit)', () => {
	let sut: UrlService;
	let repositoryMock: UrlRepository;
	let cacheMock: UrlCacheService;

	beforeEach(() => {
		repositoryMock = {
			findByShortCode: vi.fn(),
			existsByShortCode: vi.fn(),
			create: vi.fn(),
			incrementClicks: vi.fn().mockResolvedValue(1),
			getRecent: vi.fn(),
		} as unknown as UrlRepository;

		cacheMock = {
			getUrl: vi.fn(),
			setUrl: vi.fn().mockResolvedValue(undefined),
			invalidate: vi.fn().mockResolvedValue(undefined),
		} as unknown as UrlCacheService;

		sut = new UrlService(repositoryMock, cacheMock);
	});

	describe('shortenUrl', () => {
		it('should generate a 6-character short code and persist url when no customCode is provided', async () => {
			vi.mocked(repositoryMock.existsByShortCode).mockResolvedValue(false);
			vi.mocked(repositoryMock.create).mockImplementation(async (data) =>
				createUrlFixture({ short_code: data.shortCode, original_url: data.originalUrl }),
			);

			const result = await sut.shortenUrl('https://example.com');

			expect(result.short_code).toHaveLength(6);
			expect(result.original_url).toBe('https://example.com');
			expect(result.shortUrl).toContain(`/${result.short_code}`);
			expect(repositoryMock.create).toHaveBeenCalledOnce();
			expect(cacheMock.setUrl).toHaveBeenCalledWith(result.short_code, 'https://example.com');
		});

		it('should retry code generation when a collision occurs', async () => {
			vi.mocked(repositoryMock.existsByShortCode)
				.mockResolvedValueOnce(true)
				.mockResolvedValueOnce(false);

			vi.mocked(repositoryMock.create).mockImplementation(async (data) =>
				createUrlFixture({ short_code: data.shortCode }),
			);

			const result = await sut.shortenUrl('https://github.com');

			expect(repositoryMock.existsByShortCode).toHaveBeenCalledTimes(2);
			expect(result.short_code).toHaveLength(6);
		});

		it('should create short url with customCode when it is valid and available', async () => {
			vi.mocked(repositoryMock.existsByShortCode).mockResolvedValue(false);
			vi.mocked(repositoryMock.create).mockResolvedValue(
				createUrlFixture({ short_code: 'my-custom-slug', original_url: 'https://vuejs.org' }),
			);

			const result = await sut.shortenUrl('https://vuejs.org', 'my-custom-slug');

			expect(result.short_code).toBe('my-custom-slug');
			expect(repositoryMock.existsByShortCode).toHaveBeenCalledWith('my-custom-slug');
			expect(repositoryMock.create).toHaveBeenCalledWith({
				shortCode: 'my-custom-slug',
				originalUrl: 'https://vuejs.org',
			});
		});

		it('should throw ConflictError when customCode is already taken', async () => {
			vi.mocked(repositoryMock.existsByShortCode).mockResolvedValue(true);

			await expect(sut.shortenUrl('https://vuejs.org', 'taken-slug')).rejects.toThrow(
				ConflictError,
			);
			expect(repositoryMock.create).not.toHaveBeenCalled();
		});

		it('should throw BadRequestError when URL format is invalid', async () => {
			await expect(sut.shortenUrl('not-a-valid-url')).rejects.toThrow(BadRequestError);
		});

		it('should throw BadRequestError when URL is pointing to localhost or loopback', async () => {
			await expect(sut.shortenUrl('http://localhost:3000/dashboard')).rejects.toThrow(
				BadRequestError,
			);
			await expect(sut.shortenUrl('http://127.0.0.1:8080/test')).rejects.toThrow(
				BadRequestError,
			);
		});

		it('should throw BadRequestError when customCode has invalid characters or length', async () => {
			await expect(sut.shortenUrl('https://example.com', 'a')).rejects.toThrow(
				BadRequestError,
			);
			await expect(sut.shortenUrl('https://example.com', 'has spaces here')).rejects.toThrow(
				BadRequestError,
			);
			await expect(sut.shortenUrl('https://example.com', 'has$special%chars')).rejects.toThrow(
				BadRequestError,
			);
		});
	});

	describe('resolveUrl', () => {
		it('should return url from Redis cache immediately and trigger async click increment', async () => {
			vi.mocked(cacheMock.getUrl).mockResolvedValue('https://cached.org');

			const url = await sut.resolveUrl('cached-code');

			expect(url).toBe('https://cached.org');
			expect(repositoryMock.findByShortCode).not.toHaveBeenCalled();
			expect(repositoryMock.incrementClicks).toHaveBeenCalledWith('cached-code');
		});

		it('should fetch from repository, update cache, and trigger click increment on Cache Miss', async () => {
			vi.mocked(cacheMock.getUrl).mockResolvedValue(null);
			vi.mocked(repositoryMock.findByShortCode).mockResolvedValue(
				createUrlFixture({ short_code: 'db-code', original_url: 'https://db-source.org' }),
			);

			const url = await sut.resolveUrl('db-code');

			expect(url).toBe('https://db-source.org');
			expect(cacheMock.setUrl).toHaveBeenCalledWith('db-code', 'https://db-source.org');
			expect(repositoryMock.incrementClicks).toHaveBeenCalledWith('db-code');
		});

		it('should throw NotFoundError when short code does not exist in cache or database', async () => {
			vi.mocked(cacheMock.getUrl).mockResolvedValue(null);
			vi.mocked(repositoryMock.findByShortCode).mockResolvedValue(null);

			await expect(sut.resolveUrl('non-existing')).rejects.toThrow(NotFoundError);
		});
	});

	describe('getStats', () => {
		it('should return stats with shortUrl for existing code', async () => {
			vi.mocked(repositoryMock.findByShortCode).mockResolvedValue(
				createUrlFixture({ short_code: 'stats-code', clicks: 42 }),
			);

			const stats = await sut.getStats('stats-code');

			expect(stats.clicks).toBe(42);
			expect(stats.shortUrl).toContain('/stats-code');
		});

		it('should throw NotFoundError when getting stats for non-existing code', async () => {
			vi.mocked(repositoryMock.findByShortCode).mockResolvedValue(null);

			await expect(sut.getStats('missing')).rejects.toThrow(NotFoundError);
		});
	});

	describe('getRecentUrls', () => {
		it('should return recent urls list with full shortUrls', async () => {
			vi.mocked(repositoryMock.getRecent).mockResolvedValue([
				createUrlFixture({ short_code: 'c1' }),
				createUrlFixture({ short_code: 'c2' }),
			]);

			const result = await sut.getRecentUrls(10);

			expect(result).toHaveLength(2);
			expect(result[0].shortUrl).toContain('/c1');
			expect(repositoryMock.getRecent).toHaveBeenCalledWith(10);
		});
	});
});
