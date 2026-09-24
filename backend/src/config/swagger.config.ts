import type { Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';

export function getSwaggerConfig() {
	return {
		openapi: '3.0.3',
		info: {
			title: 'URL Shortener API',
			description: 'API for URL Shortener service with CQRS-lite, Redis Cache, and click analytics',
			version: '1.0.0',
		},
		servers: [
			{ url: 'http://localhost:4000', description: 'Local Development Server' },
			{ url: '/', description: 'Current Origin' },
		],
		paths: {
			'/api/shorten': {
				post: {
					summary: 'Shorten a URL',
					description: 'Creates a short URL or assigns a custom code',
					tags: ['URLs'],
					operationId: 'shortenUrl',
					requestBody: {
						required: true,
						content: {
							'application/json': {
								schema: { $ref: '#/components/schemas/ShortenRequest' },
							},
						},
					},
					responses: {
						201: {
							description: 'Shortened URL created',
							content: {
								'application/json': {
									schema: { $ref: '#/components/schemas/ShortenResponse' },
								},
							},
						},
						400: { description: 'Bad request or self-referencing URL' },
						409: { description: 'Custom short code already taken' },
					},
				},
			},
			'/api/stats/{shortCode}': {
				get: {
					summary: 'Get URL statistics',
					tags: ['URLs'],
					operationId: 'getUrlStats',
					parameters: [
						{
							name: 'shortCode',
							in: 'path',
							required: true,
							schema: { type: 'string' },
						},
					],
					responses: {
						200: {
							description: 'URL stats data',
							content: {
								'application/json': {
									schema: { $ref: '#/components/schemas/UrlStatsResponse' },
								},
							},
						},
						404: { description: 'Short code not found' },
					},
				},
			},
			'/api/urls': {
				get: {
					summary: 'Get recent shortened URLs',
					tags: ['URLs'],
					operationId: 'getRecentUrls',
					parameters: [
						{
							name: 'limit',
							in: 'query',
							required: false,
							schema: { type: 'integer', default: 20 },
						},
					],
					responses: {
						200: {
							description: 'List of recent URLs',
							content: {
								'application/json': {
									schema: { $ref: '#/components/schemas/RecentUrlsResponse' },
								},
							},
						},
					},
				},
			},
			'/{shortCode}': {
				get: {
					summary: 'Redirect to original URL',
					tags: ['URLs'],
					operationId: 'redirectToOriginal',
					parameters: [
						{
							name: 'shortCode',
							in: 'path',
							required: true,
							schema: { type: 'string' },
						},
					],
					responses: {
						302: { description: 'Redirect to target URL' },
						404: { description: 'Short code not found' },
					},
				},
			},
			'/health': {
				get: {
					summary: 'Health check',
					tags: ['Health'],
					operationId: 'getHealthStatus',
					responses: {
						200: {
							description: 'Health status response',
							content: {
								'application/json': {
									schema: { $ref: '#/components/schemas/HealthResponse' },
								},
							},
						},
					},
				},
			},
		},
		components: {
			schemas: {
				ShortenRequest: {
					type: 'object',
					required: ['url'],
					properties: {
						url: { type: 'string', format: 'uri', example: 'https://example.com' },
						customCode: { type: 'string', minLength: 3, maxLength: 20, example: 'custom-link' },
					},
				},
				UrlEntity: {
					type: 'object',
					properties: {
						id: { type: 'integer' },
						short_code: { type: 'string' },
						original_url: { type: 'string' },
						clicks: { type: 'integer' },
						created_at: { type: 'string', format: 'date-time' },
					},
				},
				ShortenResult: {
					type: 'object',
					properties: {
						id: { type: 'integer' },
						short_code: { type: 'string' },
						original_url: { type: 'string' },
						clicks: { type: 'integer' },
						created_at: { type: 'string', format: 'date-time' },
						shortUrl: { type: 'string', format: 'uri' },
					},
				},
				ShortenResponse: {
					type: 'object',
					properties: {
						success: { type: 'boolean', example: true },
						data: { $ref: '#/components/schemas/ShortenResult' },
					},
				},
				UrlStatsResponse: {
					type: 'object',
					properties: {
						success: { type: 'boolean', example: true },
						data: { $ref: '#/components/schemas/UrlEntity' },
					},
				},
				RecentUrlsResponse: {
					type: 'object',
					properties: {
						success: { type: 'boolean', example: true },
						data: {
							type: 'array',
							items: { $ref: '#/components/schemas/UrlEntity' },
						},
					},
				},
				HealthResponse: {
					type: 'object',
					properties: {
						status: { type: 'string', example: 'ok' },
						uptime: { type: 'number', example: 42.5 },
						timestamp: { type: 'string', format: 'date-time' },
					},
				},
			},
		},
	};
}

export function setupSwagger(app: Application): void {
	const swaggerDocument = getSwaggerConfig();
	const yamlDocument = YAML.stringify(swaggerDocument);

	app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

	app.get('/openapi.yaml', (_req, res) => {
		res.setHeader('Content-Type', 'text/yaml');
		res.status(200).send(yamlDocument);
	});

	app.get('/openapi.json', (_req, res) => {
		res.setHeader('Content-Type', 'application/json');
		res.status(200).json(swaggerDocument);
	});
}
