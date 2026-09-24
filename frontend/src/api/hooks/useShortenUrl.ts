import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import type { ShortenRequest, ShortenResponse } from '../generated';
import { shortenUrl } from '../requests/url';

export const useShortenUrl = (
	options?: UseMutationOptions<ShortenResponse, Error, ShortenRequest>,
) => {
	const queryClient = useQueryClient();

	return useMutation({
		...options,
		mutationFn: shortenUrl,
		onSuccess: (...args) => {
			queryClient.invalidateQueries({ queryKey: ['recent urls'] });
			options?.onSuccess?.(...args);
		},
	});
};
