import type { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';
import { UrlController } from '../../../src/controllers/url.controller';
import { UrlService } from '../../../src/services/url.service';

describe('UrlController (Unit)', () => {
	let sut: UrlController;
	let serviceMock: UrlService;
	let resMock: Partial<Response>;
	let nextMock: NextFunction;

	beforeEach(() => {
		serviceMock = {
			shortenUrl: vi.fn(),
			resolveUrl: vi.fn(),
			getStats: vi.fn(),
			getRecentUrls: vi.fn(),
		} as unknown as UrlService;

		resMock = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
			redirect: vi.fn().mockReturnThis(),
		};

		nextMock = vi.fn();

		sut = new UrlController(serviceMock);
	});

	describe('redirect', () => {
		it('should redirect 302 to original URL when shortCode is exactly 6 alphanumeric characters', async () => {
			const req = { params: { shortCode: 'aB12cD' } } as unknown as Request;
			vi.mocked(serviceMock.resolveUrl).mockResolvedValue('https://example.com');

			await sut.redirect(req, resMock as Response, nextMock);

			expect(serviceMock.resolveUrl).toHaveBeenCalledWith('aB12cD');
			expect(resMock.redirect).toHaveBeenCalledWith(302, 'https://example.com');
			expect(nextMock).not.toHaveBeenCalled();
		});

		it('should pass ZodError to next() when shortCode has invalid length or characters (e.g. favicon.ico)', async () => {
			const req = { params: { shortCode: 'favicon.ico' } } as unknown as Request;

			await sut.redirect(req, resMock as Response, nextMock);

			expect(serviceMock.resolveUrl).not.toHaveBeenCalled();
			expect(nextMock).toHaveBeenCalledWith(expect.any(ZodError));
		});

		it('should pass ZodError to next() when shortCode is too short', async () => {
			const req = { params: { shortCode: 'abc' } } as unknown as Request;

			await sut.redirect(req, resMock as Response, nextMock);

			expect(serviceMock.resolveUrl).not.toHaveBeenCalled();
			expect(nextMock).toHaveBeenCalledWith(expect.any(ZodError));
		});
	});

	describe('getStats', () => {
		it('should return stats when shortCode is valid', async () => {
			const req = { params: { shortCode: 'xyz123' } } as unknown as Request;
			const stats = {
				id: 1,
				short_code: 'xyz123',
				original_url: 'https://test.com',
				clicks: 10,
				created_at: new Date(),
				shortUrl: 'http://localhost:4000/xyz123',
			};
			vi.mocked(serviceMock.getStats).mockResolvedValue(stats);

			await sut.getStats(req, resMock as Response, nextMock);

			expect(serviceMock.getStats).toHaveBeenCalledWith('xyz123');
			expect(resMock.status).toHaveBeenCalledWith(200);
			expect(resMock.json).toHaveBeenCalledWith({ success: true, data: stats });
		});

		it('should pass ZodError to next() when getting stats for malformed shortCode', async () => {
			const req = { params: { shortCode: 'bad-code!' } } as unknown as Request;

			await sut.getStats(req, resMock as Response, nextMock);

			expect(serviceMock.getStats).not.toHaveBeenCalled();
			expect(nextMock).toHaveBeenCalledWith(expect.any(ZodError));
		});
	});
});
