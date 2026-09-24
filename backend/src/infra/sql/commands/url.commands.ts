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

	DELETE_BY_SHORT_CODE: `
		DELETE FROM urls
		WHERE short_code = $1;
	`,
} as const;
