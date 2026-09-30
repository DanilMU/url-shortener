import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(process.cwd(), '../.env'), override: true });
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });

export const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'production', 'test']),
	PORT: z.coerce.number(),
	BASE_URL: z.string().url(),

	POSTGRES_HOST: z.string(),
	POSTGRES_PORT: z.coerce.number(),
	POSTGRES_USER: z.string(),
	POSTGRES_PASSWORD: z.string(),
	POSTGRES_DB: z.string(),
	DATABASE_URL: z.string().optional(),

	REDIS_HOST: z.string(),
	REDIS_PORT: z.coerce.number(),
	REDIS_PASSWORD: z.string().optional(),
	REDIS_TTL_SECONDS: z.coerce.number(),

	CLICK_BUFFER_FLUSH_INTERVAL_MS: z.coerce.number().default(5000),
	VITE_API_URL: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export const loadEnv = (customEnv: Record<string, unknown> = process.env): Env => {
	const parsed = envSchema.safeParse(customEnv);

	if (!parsed.success) {
		const formatted = JSON.stringify(parsed.error.format(), null, 2);
		throw new Error(`Invalid environment configuration:\n${formatted}`);
	}

	return parsed.data;
};

export const env: Env = loadEnv();
