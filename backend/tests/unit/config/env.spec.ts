import { describe, expect, it } from 'vitest';
import { loadEnv } from '../../../src/config/env';

describe('loadEnv (Unit)', () => {
	it('should return parsed config when all required environment variables are valid', () => {
		const validEnv = {
			NODE_ENV: 'test',
			PORT: '4000',
			BASE_URL: 'http://localhost:4000',
			POSTGRES_HOST: 'localhost',
			POSTGRES_PORT: '5432',
			POSTGRES_USER: 'test_user',
			POSTGRES_PASSWORD: 'test_password',
			POSTGRES_DB: 'test_db',
			REDIS_HOST: 'localhost',
			REDIS_PORT: '6379',
			REDIS_TTL_SECONDS: '3600',
			CLICK_BUFFER_FLUSH_INTERVAL_MS: '5000',
		};

		const config = loadEnv(validEnv);

		expect(config.NODE_ENV).toBe('test');
		expect(config.PORT).toBe(4000);
		expect(config.CLICK_BUFFER_FLUSH_INTERVAL_MS).toBe(5000);
		expect(config.POSTGRES_HOST).toBe('localhost');
	});

	it('should throw an Error with validation details when required variables are missing (without process.exit)', () => {
		const invalidEnv = {
			NODE_ENV: 'not_a_valid_env',
		};

		expect(() => loadEnv(invalidEnv)).toThrow(/Invalid environment configuration/);
	});
});
