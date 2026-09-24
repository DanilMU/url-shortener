import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../../setup/api-test.setup';

describe('Swagger & OpenAPI Documentation (Integration)', () => {
	it('should serve YAML specification at GET /openapi.yaml', async () => {
		const res = await request(app).get('/openapi.yaml');

		expect(res.status).toBe(200);
		expect(res.headers['content-type']).toContain('text/yaml');
		expect(res.text).toContain('openapi: 3.0.3');
		expect(res.text).toContain('title: URL Shortener API');
		expect(res.text).toContain('/api/shorten:');
	});

	it('should serve JSON specification at GET /openapi.json', async () => {
		const res = await request(app).get('/openapi.json');

		expect(res.status).toBe(200);
		expect(res.headers['content-type']).toContain('application/json');
		expect(res.body.openapi).toBe('3.0.3');
		expect(res.body.info.title).toBe('URL Shortener API');
		expect(res.body.paths).toHaveProperty('/api/shorten');
		expect(res.body.paths).toHaveProperty('/health');
		expect(res.body.components.schemas).toHaveProperty('ShortenRequest');
	});

	it('should serve Swagger UI HTML page at GET /docs/', async () => {
		const res = await request(app).get('/docs/');

		expect(res.status).toBe(200);
		expect(res.headers['content-type']).toContain('text/html');
		expect(res.text).toContain('swagger-ui');
	});

	it('should redirect /api/docs to /docs', async () => {
		const res = await request(app).get('/api/docs');

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('/docs');
	});
});
