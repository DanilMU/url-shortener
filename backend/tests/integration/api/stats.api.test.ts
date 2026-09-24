import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { app, resetStorage } from '../../setup/api-test.setup';

describe('GET /api/stats & /api/urls (Analytics API Integration)', () => {
	beforeEach(async () => {
		await resetStorage();
	});

	it('should return stats with accurate clicks count after redirects', async () => {
		await request(app)
			.post('/api/shorten')
			.send({ url: 'https://react.dev', customCode: 'stats-link' });

		await request(app).get('/stats-link');
		await request(app).get('/stats-link');

		await new Promise((r) => setTimeout(r, 80));

		const statsRes = await request(app).get('/api/stats/stats-link');

		expect(statsRes.status).toBe(200);
		expect(statsRes.body.data.short_code).toBe('stats-link');
		expect(statsRes.body.data.clicks).toBe(2);
	});

	it('should return list of recently created urls', async () => {
		await request(app).post('/api/shorten').send({ url: 'https://url1.com' });
		await request(app).post('/api/shorten').send({ url: 'https://url2.com' });

		const res = await request(app).get('/api/urls?limit=10');

		expect(res.status).toBe(200);
		expect(res.body.data.length).toBeGreaterThanOrEqual(2);
	});
});
