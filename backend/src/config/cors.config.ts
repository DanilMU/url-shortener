import type { CorsOptions } from 'cors';

export function getCorsConfig(): CorsOptions {
	return {
		origin: (origin, callback) => {
			// Разрешаем запросы без Origin (curl, mobile, server-to-server)
			if (!origin) {
				return callback(null, true);
			}

			// Разрешаем любые локальные порты для разработки (localhost:3000, 5173, etc.)
			const isLocalhost =
				/^https?:\/\/localhost(:\d+)?$/.test(origin) ||
				/^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin);

			if (isLocalhost) {
				return callback(null, true);
			}

			return callback(null, true);
		},
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
	};
}
