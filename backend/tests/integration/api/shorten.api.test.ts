import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { app, resetStorage } from '../../setup/api-test.setup';

describe('POST /api/shorten (API Integration)', () => {
	beforeEach(async () => {
		await resetStorage();
	});

	it('should return 200 OK on healthcheck', async () => {
		const res = await request(app).get('/health');

		expect(res.status).toBe(200);
		expect(res.body.status).toBe('ok');
	});

	it('should create short URL with 6-char code when given a valid URL', async () => {
		const res = await request(app)
			.post('/api/shorten')
			.send({ url: 'https://vite.dev' });

		expect(res.status).toBe(201);
		expect(res.body.success).toBe(true);
		expect(res.body.data.short_code).toHaveLength(6);
		expect(res.body.data.original_url).toBe('https://vite.dev');
		expect(res.body.data.shortUrl).toContain(`/${res.body.data.short_code}`);
	});

	it('should create short URL with customCode when available', async () => {
		const res = await request(app)
			.post('/api/shorten')
			.send({ url: 'https://vite.dev', customCode: 'custom-vite' });

		expect(res.status).toBe(201);
		expect(res.body.data.short_code).toBe('custom-vite');
	});

	it('should return 409 Conflict when customCode is already in use', async () => {
		await request(app)
			.post('/api/shorten')
			.send({ url: 'https://vite.dev', customCode: 'taken-code' });

		const res = await request(app)
			.post('/api/shorten')
			.send({ url: 'https://another.com', customCode: 'taken-code' });

		expect(res.status).toBe(409);
		expect(res.body.success).toBe(false);
		expect(res.body.message).toContain('already taken');
	});

	it('should return 400 Bad Request with validation errors on invalid URL', async () => {
		const res = await request(app)
			.post('/api/shorten')
			.send({ url: 'not-a-valid-url' });

		expect(res.status).toBe(400);
		expect(res.body.success).toBe(false);
		expect(res.body.errors).toBeDefined();
	});
});
