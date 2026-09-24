import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../../setup/api-test.setup';

describe('CORS Configuration (API Integration)', () => {
	it('should allow requests from http://localhost:3000 with credentials', async () => {
		const res = await request(app)
			.get('/health')
			.set('Origin', 'http://localhost:3000');

		expect(res.status).toBe(200);
		expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
		expect(res.headers['access-control-allow-credentials']).toBe('true');
	});

	it('should support preflight OPTIONS request from frontend origin', async () => {
		const res = await request(app)
			.options('/api/shorten')
			.set('Origin', 'http://localhost:3000')
			.set('Access-Control-Request-Method', 'POST')
			.set('Access-Control-Request-Headers', 'Content-Type');

		expect(res.status).toBe(204);
		expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
		expect(res.headers['access-control-allow-credentials']).toBe('true');
	});
});
