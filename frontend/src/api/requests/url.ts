import type {
    GetRecentUrlsParams,
    RecentUrlsResponse,
    ShortenRequest,
    ShortenResponse,
    UrlStatsResponse,
} from '../generated';
import { instance } from '../instance';

export const shortenUrl = (data: ShortenRequest): Promise<ShortenResponse> =>
	instance.post<ShortenResponse>('/api/shorten', data).then((res) => res.data);

export const getRecentUrls = (params?: GetRecentUrlsParams): Promise<RecentUrlsResponse> =>
	instance.get<RecentUrlsResponse>('/api/urls', { params }).then((res) => res.data);

export const getUrlStats = (shortCode: string): Promise<UrlStatsResponse> =>
	instance.get<UrlStatsResponse>(`/api/stats/${shortCode}`).then((res) => res.data);
