import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { UrlService, urlService } from '../services/url.service';

const shortenRequestSchema = z.object({
	url: z.string().url('A valid URL is required'),
	customCode: z
		.string()
		.min(3, 'Custom code must be at least 3 characters')
		.max(20, 'Custom code must not exceed 20 characters')
		.regex(/^[a-zA-Z0-9_-]+$/, 'Custom code can only contain letters, numbers, hyphens, and underscores')
		.optional(),
});

export class UrlController {
	public constructor(private readonly service: UrlService = urlService) {}

	public shorten = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const { url, customCode } = shortenRequestSchema.parse(req.body);
			const result = await this.service.shortenUrl(url, customCode);

			res.status(201).json({
				success: true,
				data: result,
			});
		} catch (error) {
			next(error);
		}
	};

	public redirect = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const shortCode = String(req.params.shortCode);
			const originalUrl = await this.service.resolveUrl(shortCode);

			res.redirect(302, originalUrl);
		} catch (error) {
			next(error);
		}
	};

	public getStats = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const shortCode = String(req.params.shortCode);
			const stats = await this.service.getStats(shortCode);

			res.status(200).json({
				success: true,
				data: stats,
			});
		} catch (error) {
			next(error);
		}
	};

	public getRecent = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const limit = req.query.limit ? Math.min(Number(req.query.limit), 100) : 20;
			const urls = await this.service.getRecentUrls(limit);

			res.status(200).json({
				success: true,
				data: urls,
			});
		} catch (error) {
			next(error);
		}
	};
}

export const urlController = new UrlController();
