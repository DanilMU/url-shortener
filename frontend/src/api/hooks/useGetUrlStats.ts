import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { UrlStatsResponse } from '../generated';
import { getUrlStats } from '../requests/url';

export const useGetUrlStats = (
	shortCode: string,
	options?: Omit<
		UseQueryOptions<UrlStatsResponse, Error, UrlStatsResponse>,
		'queryKey' | 'queryFn'
	>,
) =>
	useQuery({
		queryKey: ['url stats', shortCode],
		queryFn: () => getUrlStats(shortCode),
		enabled: Boolean(shortCode),
		...options,
	});
