export const URL_COMMANDS = {
	CREATE_URL: `
		INSERT INTO urls (short_code, original_url)
		VALUES ($1, $2)
		RETURNING id, short_code, original_url, clicks, created_at;
	`,

	INCREMENT_CLICKS: `
		UPDATE urls
		SET clicks = clicks + 1
		WHERE short_code = $1
		RETURNING clicks;
	`,

	BATCH_INCREMENT_CLICKS: `
		UPDATE urls
		SET clicks = urls.clicks + c.delta
		FROM (
			SELECT unnest($1::text[]) AS short_code, unnest($2::int[]) AS delta
		) AS c
		WHERE urls.short_code = c.short_code
		RETURNING urls.short_code;
	`,

	DELETE_BY_SHORT_CODE: `
		DELETE FROM urls
		WHERE short_code = $1;
	`,
} as const;
