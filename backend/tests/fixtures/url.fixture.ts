import type { UrlEntity } from '../../src/repositories/url.repository';

export const createUrlFixture = (overrides: Partial<UrlEntity> = {}): UrlEntity => ({
	id: 1,
	short_code: 'fixture-code',
	original_url: 'https://example.com',
	clicks: 0,
	created_at: new Date('2026-01-01T00:00:00Z'),
	...overrides,
});
