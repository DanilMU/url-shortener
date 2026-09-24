import type { DefaultOptions } from '@tanstack/react-query';

export const REACT_QUERY_CONFIG: DefaultOptions = {
	queries: {
		staleTime: 1000 * 60 * 3,
		gcTime: 1000 * 60 * 10,
		refetchOnWindowFocus: false,
		refetchOnReconnect: true,
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
	},
	mutations: {
		retry: 1,
	},
};
