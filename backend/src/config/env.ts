import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
	NODE_ENV: z
		.enum(['development', 'production', 'test'])
		.default('development'),
	PORT: z.coerce.number().default(4000),
	BASE_URL: z
		.string()
		.default('http://localhost:4000')
		.transform((val) => {
			if (!val || val === '/') return `http://localhost:${process.env.PORT || 4000}`;
			return val;
		})
		.pipe(z.string().url()),

	POSTGRES_HOST: z.string().default('localhost'),
	POSTGRES_PORT: z.coerce.number().default(5433),
	POSTGRES_USER: z.string().default('postgres'),
	POSTGRES_PASSWORD: z.string().default('123456'),
	POSTGRES_DB: z.string().default('url_shortener'),
	DATABASE_URL: z.string().optional(),

	REDIS_HOST: z.string().default('localhost'),
	REDIS_PORT: z.coerce.number().default(6379),
	REDIS_PASSWORD: z.string().optional().default(''),
	REDIS_TTL_SECONDS: z.coerce.number().default(3600),

	VITE_API_URL: z.string().optional(),
});

const parseEnv = () => {
	const parsed = envSchema.safeParse(process.env);

	if (!parsed.success) {
		console.error('❌ Invalid environment variables:');
		console.error(JSON.stringify(parsed.error.format(), null, 2));
		process.exit(1);
	}

	return parsed.data;
};

export const env = parseEnv();
export type Env = z.infer<typeof envSchema>;
