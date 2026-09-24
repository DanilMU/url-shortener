export const UrlCacheKeys = {
	byShortCode: (code: string) => `url:${code}`,
} as const;
