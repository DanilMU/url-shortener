import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../../../src/config/db';
import { UrlRepository } from '../../../src/repositories/url.repository';
import { cleanDatabase } from '../../setup/test-db.helper';

describe('UrlRepository (Integration with PostgreSQL)', () => {
	const repository = new UrlRepository(db);

	beforeEach(async () => {
		await cleanDatabase();
	});

	describe('create and findByShortCode', () => {
		it('should persist a new URL entity in PostgreSQL and retrieve it', async () => {
			const created = await repository.create({
				shortCode: 'pg-test',
				originalUrl: 'https://postgresql.org',
			});

			expect(created.id).toBeDefined();
			expect(created.short_code).toBe('pg-test');
			expect(created.original_url).toBe('https://postgresql.org');
			expect(created.clicks).toBe(0);

			const found = await repository.findByShortCode('pg-test');
			expect(found).not.toBeNull();
			expect(found?.short_code).toBe('pg-test');
			expect(found?.original_url).toBe('https://postgresql.org');
		});

		it('should enforce unique constraint on short_code at database level', async () => {
			await repository.create({
				shortCode: 'unique-code',
				originalUrl: 'https://first.com',
			});

			await expect(
				repository.create({
					shortCode: 'unique-code',
					originalUrl: 'https://second.com',
				}),
			).rejects.toThrowError();
		});
	});

	describe('existsByShortCode', () => {
		it('should return true when short_code exists and false when it does not', async () => {
			await repository.create({
				shortCode: 'exists-check',
				originalUrl: 'https://test.com',
			});

			const exists = await repository.existsByShortCode('exists-check');
			const missing = await repository.existsByShortCode('definitely-missing');

			expect(exists).toBe(true);
			expect(missing).toBe(false);
		});
	});

	describe('incrementClicks', () => {
		it('should atomically increment click count in database', async () => {
			await repository.create({
				shortCode: 'click-counter',
				originalUrl: 'https://click.org',
			});

			const click1 = await repository.incrementClicks('click-counter');
			const click2 = await repository.incrementClicks('click-counter');
			const found = await repository.findByShortCode('click-counter');

			expect(click1).toBe(1);
			expect(click2).toBe(2);
			expect(found?.clicks).toBe(2);
		});
	});

	describe('getRecent', () => {
		it('should return recent URLs limited by count in descending order', async () => {
			await repository.create({ shortCode: 'link1', originalUrl: 'https://link1.com' });
			await repository.create({ shortCode: 'link2', originalUrl: 'https://link2.com' });
			await repository.create({ shortCode: 'link3', originalUrl: 'https://link3.com' });

			const recent = await repository.getRecent(2);

			expect(recent).toHaveLength(2);
			expect(recent[0].short_code).toBe('link3');
			expect(recent[1].short_code).toBe('link2');
		});
	});
});
