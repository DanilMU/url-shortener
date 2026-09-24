import { Pool, type QueryResultRow } from 'pg';
import { env } from './env';

export class DatabaseService {
	private readonly pool: Pool;

	public constructor() {
		this.pool = new Pool({
			host: env.POSTGRES_HOST,
			port: env.POSTGRES_PORT,
			user: env.POSTGRES_USER,
			password: env.POSTGRES_PASSWORD,
			database: env.POSTGRES_DB,
			max: 20,
			idleTimeoutMillis: 30000,
			connectionTimeoutMillis: 5000,
		});

		this.pool.on('error', (err) => {
			console.error('❌ Unexpected error on idle PostgreSQL client:', err);
		});
	}

	public async init(): Promise<void> {
		const start = Date.now();
		console.log('🔄 Connecting to PostgreSQL...');

		try {
			await this.pool.query('SELECT 1');
			const ms = Date.now() - start;
			console.log(`✅ Connected to PostgreSQL database "${env.POSTGRES_DB}" in ${ms}ms`);
		} catch (error) {
			console.error('❌ Failed to connect to PostgreSQL:', error);
			throw error;
		}
	}

	public async raw<T extends QueryResultRow = QueryResultRow>(
		query: string,
		params: unknown[] = [],
	): Promise<T[]> {
		const result = await this.pool.query<T>(query, params);
		return result.rows;
	}

	public async close(): Promise<void> {
		console.log('🔄 Closing PostgreSQL connection pool...');
		try {
			await this.pool.end();
			console.log('✅ PostgreSQL connection pool closed');
		} catch (error) {
			console.error('❌ Error closing PostgreSQL pool:', error);
		}
	}
}

export const db = new DatabaseService();
