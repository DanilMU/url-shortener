import { DatabaseService, db } from '../config/db';
import { URL_COMMANDS } from '../infra/sql/commands/url.commands';
import { URL_QUERIES } from '../infra/sql/queries/url.queries';

export interface UrlEntity {
	id: number;
	short_code: string;
	original_url: string;
	clicks: number;
	created_at: Date;
}

export class UrlRepository {
	public constructor(private readonly database: DatabaseService = db) {}

	public async findByShortCode(code: string): Promise<UrlEntity | null> {
		const rows = await this.database.raw<UrlEntity>(
			URL_QUERIES.FIND_BY_SHORT_CODE,
			[code],
		);
		return rows[0] ?? null;
	}

	public async existsByShortCode(code: string): Promise<boolean> {
		const rows = await this.database.raw<{ '?column?': number }>(
			URL_QUERIES.EXISTS_BY_SHORT_CODE,
			[code],
		);
		return rows.length > 0;
	}

	public async create(data: { shortCode: string; originalUrl: string }): Promise<UrlEntity> {
		const rows = await this.database.raw<UrlEntity>(
			URL_COMMANDS.CREATE_URL,
			[data.shortCode, data.originalUrl],
		);
		return rows[0];
	}

	public async incrementClicks(code: string): Promise<number | null> {
		const rows = await this.database.raw<{ clicks: number }>(
			URL_COMMANDS.INCREMENT_CLICKS,
			[code],
		);
		return rows[0]?.clicks ?? null;
	}

	public async getRecent(limit: number = 20): Promise<UrlEntity[]> {
		return this.database.raw<UrlEntity>(
			URL_QUERIES.GET_RECENT_URLS,
			[limit],
		);
	}
}

export const urlRepository = new UrlRepository();
