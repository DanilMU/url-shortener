export const UrlCacheKeys = {
	byShortCode: (code: string) => `url:${code}`,
	clicksBuffer: 'url:clicks:buffer',
	clicksProcessing: 'url:clicks:buffer:processing',
} as const;
