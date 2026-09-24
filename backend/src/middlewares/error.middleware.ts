import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/app.error';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
	if (err instanceof ZodError) {
		const errors = err.issues.map((issue) => ({
			field: issue.path.join('.'),
			message: issue.message,
		}));

		res.status(400).json({
			success: false,
			message: 'Validation failed',
			errors,
		});
		return;
	}

	if (err instanceof AppError) {
		res.status(err.statusCode).json({
			success: false,
			message: err.message,
		});
		return;
	}

	console.error('💥 Unhandled Error:', err);

	res.status(500).json({
		success: false,
		message: 'Internal server error',
	});
};
