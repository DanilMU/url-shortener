import { BarChart3, Check, Copy, ExternalLink, LinkIcon, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import type { UrlEntity } from '../api/generated';
import { useGetRecentUrls } from '../api/hooks';

export function RecentUrlsTable() {
	const { data, isLoading, refetch, isFetching } = useGetRecentUrls({ limit: 20 });
	const [copiedCode, setCopiedCode] = useState<string | null>(null);

	const urls: UrlEntity[] = data?.data ?? [];
	const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';

	const handleCopy = async (code?: string) => {
		if (!code) return;
		const fullUrl = `${baseUrl}/${code}`;
		try {
			await navigator.clipboard.writeText(fullUrl);
			setCopiedCode(code);
			setTimeout(() => setCopiedCode(null), 2000);
		} catch {
			// fallback
		}
	};

	return (
		<div className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-sm sm:p-8">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h3 className="text-lg font-bold text-white sm:text-xl">
						Недавние ссылки
					</h3>
					<p className="text-xs text-slate-400">
						Список последних сокращенных URL и счетчик переходов в реальном времени
					</p>
				</div>

				<button
					type="button"
					onClick={() => refetch()}
					disabled={isFetching}
					className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-700 hover:text-white disabled:opacity-50"
				>
					<RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
					<span className="hidden sm:inline">Обновить</span>
				</button>
			</div>

			{isLoading ? (
				<div className="flex h-36 items-center justify-center">
					<div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
				</div>
			) : urls.length === 0 ? (
				<div className="flex h-36 flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 p-6 text-center">
					<LinkIcon className="mb-2 h-8 w-8 text-slate-600" />
					<p className="text-sm font-medium text-slate-400">Пока нет созданных ссылок</p>
					<p className="text-xs text-slate-500">Сократите свою первую ссылку выше</p>
				</div>
			) : (
				<div className="overflow-x-auto">
					<table className="w-full text-left text-xs">
						<thead>
							<tr className="border-b border-slate-800 text-slate-400">
								<th className="pb-3 font-semibold">Короткий код</th>
								<th className="pb-3 font-semibold">Оригинальный URL</th>
								<th className="pb-3 text-center font-semibold">Клики</th>
								<th className="pb-3 text-right font-semibold">Создана</th>
								<th className="pb-3 text-right font-semibold">Действия</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-800/60">
							{urls.map((item: UrlEntity) => {
								const shortUrl = `${baseUrl}/${item.short_code}`;
								const isCopied = copiedCode === item.short_code;
								const dateFormatted = item.created_at
									? new Date(item.created_at).toLocaleString('ru-RU', {
											day: 'numeric',
											month: 'short',
											hour: '2-digit',
											minute: '2-digit',
										})
									: '—';

								return (
									<tr key={item.id} className="transition-colors hover:bg-slate-800/30">
										<td className="py-3.5 font-mono font-medium text-indigo-400">
											<span className="rounded bg-indigo-500/10 px-2 py-1 border border-indigo-500/20">
												/{item.short_code}
											</span>
										</td>
										<td className="max-w-[220px] truncate py-3.5 text-slate-300 sm:max-w-xs" title={item.original_url}>
											{item.original_url}
										</td>
										<td className="py-3.5 text-center">
											<span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-0.5 font-semibold text-slate-200">
												<BarChart3 className="h-3 w-3 text-indigo-400" />
												{item.clicks ?? 0}
											</span>
										</td>
										<td className="py-3.5 text-right text-slate-400">
											{dateFormatted}
										</td>
										<td className="py-3.5 text-right">
											<div className="flex items-center justify-end gap-1.5">
												<button
													type="button"
													onClick={() => handleCopy(item.short_code)}
													className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
													title="Скопировать ссылку"
												>
													{isCopied ? (
														<Check className="h-4 w-4 text-emerald-400" />
													) : (
														<Copy className="h-4 w-4" />
													)}
												</button>

												<a
													href={shortUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
													title="Перейти по ссылке"
												>
													<ExternalLink className="h-4 w-4" />
												</a>
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
