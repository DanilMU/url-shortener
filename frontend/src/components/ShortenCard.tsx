import type { AxiosError } from 'axios';
import { AlertCircle, Check, Copy, ExternalLink, Loader2, Sparkles } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import type { ShortenResult } from '../api/generated';
import { useShortenUrl } from '../api/hooks';

export function ShortenCard() {
	const [url, setUrl] = useState('');
	const [customCode, setCustomCode] = useState('');
	const [copied, setCopied] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [lastResult, setLastResult] = useState<ShortenResult | null>(null);

	const shortenMutation = useShortenUrl({
		onSuccess: (response) => {
			if (response.data) {
				setLastResult(response.data);
			}
			setErrorMessage(null);
			setUrl('');
			setCustomCode('');
		},
		onError: (error: Error) => {
			const axiosError = error as AxiosError<{ error?: { message?: string } }>;
			const serverMsg =
				axiosError.response?.data?.error?.message ||
				axiosError.message ||
				'Произошла ошибка при сокращении ссылки';
			setErrorMessage(serverMsg);
		},
	});

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (!url.trim()) return;

		setErrorMessage(null);
		shortenMutation.mutate({
			url: url.trim(),
			customCode: customCode.trim() || undefined,
		});
	};

	const handleCopy = async (textToCopy?: string) => {
		if (!textToCopy) return;
		try {
			await navigator.clipboard.writeText(textToCopy);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// fallback
		}
	};

	return (
		<div className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-sm sm:p-8">
			<div className="mb-6">
				<h2 className="text-xl font-bold text-white sm:text-2xl">
					Сократить ссылку
				</h2>
				<p className="mt-1 text-sm text-slate-400">
					Введите длинный URL и получите короткую ссылку с кэшированием в Redis и аналитикой кликов
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label htmlFor="url-input" className="mb-1.5 block text-xs font-medium text-slate-300">
						Целевой URL <span className="text-rose-400">*</span>
					</label>
					<input
						id="url-input"
						type="url"
						required
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						placeholder="https://example.com/very/long/path/to/resource"
						className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
					/>
				</div>

				<div>
					<label htmlFor="custom-code-input" className="mb-1.5 block text-xs font-medium text-slate-300">
						Кастомный алиас <span className="text-slate-500">(необязательно, от 3 до 20 символов)</span>
					</label>
					<div className="relative">
						<span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-xs font-mono text-slate-500">
							/
						</span>
						<input
							id="custom-code-input"
							type="text"
							value={customCode}
							onChange={(e) => setCustomCode(e.target.value)}
							placeholder="my-custom-slug"
							maxLength={20}
							className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-3 pl-8 pr-4 text-sm font-mono text-white placeholder-slate-500 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
						/>
					</div>
				</div>

				{errorMessage && (
					<div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
						<AlertCircle className="h-4 w-4 shrink-0" />
						<span>{errorMessage}</span>
					</div>
				)}

				<button
					type="submit"
					disabled={shortenMutation.isPending || !url.trim()}
					className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-600/35 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{shortenMutation.isPending ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin" />
							<span>Генерация ссылки...</span>
						</>
					) : (
						<>
							<Sparkles className="h-4 w-4" />
							<span>Сократить URL</span>
						</>
					)}
				</button>
			</form>

			{lastResult && lastResult.shortUrl && (
				<div className="mt-6 rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4">
					<div className="flex items-center justify-between gap-3">
						<div className="min-w-0 flex-1">
							<span className="text-[11px] font-medium uppercase tracking-wider text-indigo-400">
								Готовая короткая ссылка
							</span>
							<p className="truncate text-base font-semibold text-white">
								{lastResult.shortUrl}
							</p>
							<p className="truncate text-xs text-slate-400">
								Оригинал: {lastResult.original_url}
							</p>
						</div>

						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={() => handleCopy(lastResult.shortUrl)}
								className="flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-600/20 px-3 py-2 text-xs font-medium text-indigo-200 transition-colors hover:bg-indigo-600/30"
							>
								{copied ? (
									<>
										<Check className="h-3.5 w-3.5 text-emerald-400" />
										<span className="text-emerald-400">Скопировано!</span>
									</>
								) : (
									<>
										<Copy className="h-3.5 w-3.5" />
										<span>Копировать</span>
									</>
								)}
							</button>

							<a
								href={lastResult.shortUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
								title="Перейти по ссылке"
							>
								<ExternalLink className="h-4 w-4" />
							</a>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
