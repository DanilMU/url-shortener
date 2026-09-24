import cors from 'cors';
import express, { type Application } from 'express';
import morgan from 'morgan';
import { errorHandler } from './middlewares/error.middleware';
import { router } from './routes/url.routes';

export const createApp = (): Application => {
	const app = express();

	app.use(cors());
	app.use(express.json());
	app.use(morgan('dev'));

	app.get('/health', (_req, res) => {
		res.status(200).json({
			status: 'ok',
			uptime: process.uptime(),
			timestamp: new Date().toISOString(),
		});
	});

	app.use(router);
	app.use(errorHandler);

	return app;
};
