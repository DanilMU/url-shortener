export const URL_QUERIES = {
	FIND_BY_SHORT_CODE: `
		SELECT id, short_code, original_url, clicks, created_at
		FROM urls
		WHERE short_code = $1
		LIMIT 1;
	`,

	EXISTS_BY_SHORT_CODE: `
		SELECT 1
		FROM urls
		WHERE short_code = $1
		LIMIT 1;
	`,

	GET_RECENT_URLS: `
		SELECT id, short_code, original_url, clicks, created_at
		FROM urls
		ORDER BY created_at DESC
		LIMIT $1;
	`,
} as const;
