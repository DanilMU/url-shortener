import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { app, resetStorage } from '../../setup/api-test.setup';

describe('GET /:shortCode (Redirection API Integration)', () => {
	beforeEach(async () => {
		await resetStorage();
	});

	it('should return 302 Found and redirect to original URL', async () => {
		await request(app)
			.post('/api/shorten')
			.send({ url: 'https://nodejs.org', customCode: 'node-redirect' });

		const res = await request(app).get('/node-redirect');

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('https://nodejs.org');
	});

	it('should return 404 Not Found for non-existing short code', async () => {
		const res = await request(app).get('/missing-link');

		expect(res.status).toBe(404);
		expect(res.body.success).toBe(false);
	});
});
