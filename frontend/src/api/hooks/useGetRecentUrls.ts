import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { GetRecentUrlsParams, RecentUrlsResponse } from '../generated';
import { getRecentUrls } from '../requests/url';

export const useGetRecentUrls = (
	params?: GetRecentUrlsParams,
	options?: Omit<
		UseQueryOptions<RecentUrlsResponse, Error, RecentUrlsResponse>,
		'queryKey' | 'queryFn'
	>,
) =>
	useQuery({
		queryKey: ['recent urls', params],
		queryFn: () => getRecentUrls(params),
		...options,
	});
