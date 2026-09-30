import { createApp } from './app';
import { db } from './config/db';
import { env } from './config/env';
import { redis } from './config/redis';
import { clickBufferService } from './services/click-buffer.service';

const bootstrap = async () => {
	try {
		console.log('🚀 Starting URL Shortener Backend Service...');
		console.log(`🌍 Environment: ${env.NODE_ENV}`);

		await db.init();
		await redis.init();

		clickBufferService.start(env.CLICK_BUFFER_FLUSH_INTERVAL_MS);

		const app = createApp();

		const server = app.listen(env.PORT, () => {
			console.log(`⚡ Server running at http://localhost:${env.PORT}`);
			console.log(`🔗 Health check available at http://localhost:${env.PORT}/health`);
		});

		const shutdown = async (signal: string) => {
			console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

			server.close(async () => {
				console.log('🛑 HTTP server closed.');

				try {
					console.log('🔄 Flushing click buffer to PostgreSQL...');
					try {
						await clickBufferService.flush();
					} catch (flushErr) {
						console.error('⚠️ Error flushing click buffer during shutdown:', flushErr);
					}
					clickBufferService.stop();

					await redis.close();
					await db.close();
					console.log('✅ Graceful shutdown completed cleanly.');
					process.exit(0);
				} catch (err) {
					console.error('❌ Error during shutdown:', err);
					process.exit(1);
				}
			});

			setTimeout(() => {
				console.error('⚠️ Forcing shutdown after timeout');
				process.exit(1);
			}, 10000).unref();
		};

		process.on('SIGINT', () => shutdown('SIGINT'));
		process.on('SIGTERM', () => shutdown('SIGTERM'));
	} catch (error) {
		console.error('❌ Fatal error during bootstrap:', error);
		process.exit(1);
	}
};

bootstrap();
