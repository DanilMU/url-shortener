import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UrlCacheService } from '../../../src/infra/cache/url.cache.service';
import { UrlRepository } from '../../../src/repositories/url.repository';
import { ClickBufferService } from '../../../src/services/click-buffer.service';

describe('ClickBufferService (Unit)', () => {
	let sut: ClickBufferService;
	let cacheMock: UrlCacheService;
	let repositoryMock: UrlRepository;

	beforeEach(() => {
		cacheMock = {
			snapshotAndClearBuffer: vi.fn(),
			clearProcessingBuffer: vi.fn().mockResolvedValue(undefined),
			restoreBuffer: vi.fn().mockResolvedValue(undefined),
			invalidate: vi.fn().mockResolvedValue(undefined),
		} as unknown as UrlCacheService;

		repositoryMock = {
			batchIncrementClicks: vi.fn(),
		} as unknown as UrlRepository;

		sut = new ClickBufferService(cacheMock, repositoryMock);
	});

	describe('flush', () => {
		it('should do nothing and return 0 if buffer snapshot is empty', async () => {
			vi.mocked(cacheMock.snapshotAndClearBuffer).mockResolvedValue({});

			const flushed = await sut.flush();

			expect(flushed).toBe(0);
			expect(repositoryMock.batchIncrementClicks).not.toHaveBeenCalled();
			expect(cacheMock.clearProcessingBuffer).not.toHaveBeenCalled();
		});

		it('should batch increment clicks in database and clear processing buffer on success', async () => {
			vi.mocked(cacheMock.snapshotAndClearBuffer).mockResolvedValue({
				code1: 5,
				code2: 12,
			});
			vi.mocked(repositoryMock.batchIncrementClicks).mockResolvedValue(['code1', 'code2']);

			const flushed = await sut.flush();

			expect(flushed).toBe(17);
			expect(repositoryMock.batchIncrementClicks).toHaveBeenCalledWith([
				{ code: 'code1', delta: 5 },
				{ code: 'code2', delta: 12 },
			]);
			expect(cacheMock.clearProcessingBuffer).toHaveBeenCalledOnce();
			expect(cacheMock.invalidate).not.toHaveBeenCalled();
		});

		it('should invalidate Redis cache for codes deleted from DB (stale cache detection)', async () => {
			vi.mocked(cacheMock.snapshotAndClearBuffer).mockResolvedValue({
				activeCode: 3,
				deletedCode: 7,
			});
			// Only activeCode exists in database
			vi.mocked(repositoryMock.batchIncrementClicks).mockResolvedValue(['activeCode']);

			const flushed = await sut.flush();

			expect(flushed).toBe(10);
			expect(cacheMock.invalidate).toHaveBeenCalledWith('deletedCode');
			expect(cacheMock.clearProcessingBuffer).toHaveBeenCalledOnce();
		});

		it('should restore buffer and rethrow error if database update fails', async () => {
			const snapshot = { code1: 10 };
			vi.mocked(cacheMock.snapshotAndClearBuffer).mockResolvedValue(snapshot);
			vi.mocked(repositoryMock.batchIncrementClicks).mockRejectedValue(new Error('DB connection dead'));

			await expect(sut.flush()).rejects.toThrow('DB connection dead');
			expect(cacheMock.restoreBuffer).toHaveBeenCalledWith(snapshot);
			expect(cacheMock.clearProcessingBuffer).not.toHaveBeenCalled();
		});
	});

	describe('lifecycle', () => {
		it('should start and stop timer without errors', () => {
			sut.start(1000);
			sut.stop();
		});
	});
});
