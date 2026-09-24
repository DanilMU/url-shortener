import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(process.cwd(), '../.env'), override: true });
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });

const envSchema = z.object({
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

	VITE_API_URL: z.string().optional(),
});

const parseEnv = () => {
	const parsed = envSchema.safeParse(process.env);

	if (!parsed.success) {
		console.error('❌ Missing or invalid environment variables in .env:');
		console.error(JSON.stringify(parsed.error.format(), null, 2));
		process.exit(1);
	}

	return parsed.data;
};

export const env = parseEnv();
export type Env = z.infer<typeof envSchema>;
