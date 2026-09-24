import type { AxiosError } from 'axios';
import { AlertCircle, Check, Copy, ExternalLink, Loader2, Settings2, Sparkles } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import type { ShortenResult } from '../api/generated';
import { useShortenUrl } from '../api/hooks';

export function ShortenCard() {
	const [url, setUrl] = useState('');
	const [customCode, setCustomCode] = useState('');
	const [showCustomCode, setShowCustomCode] = useState(false);
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
			setShowCustomCode(false);
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
		<div className="w-full max-w-2xl mx-auto space-y-4">
			<form onSubmit={handleSubmit} className="space-y-3">
				{/* Основная строка ввода */}
				<div className="relative flex flex-col sm:flex-row items-stretch rounded-2xl border border-slate-800 bg-slate-900/90 p-2 shadow-2xl backdrop-blur-md focus-within:border-indigo-500/70 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
					<input
						type="url"
						required
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						placeholder="Вставьте длинную ссылку (например: https://example.com/...)"
						className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none"
					/>

					<div className="flex items-center gap-2 px-2 pb-2 sm:pb-0">
						<button
							type="button"
							onClick={() => setShowCustomCode(!showCustomCode)}
							className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
								showCustomCode || customCode
									? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
									: 'text-slate-400 hover:bg-slate-800 hover:text-white'
							}`}
							title="Задать свой короткий код"
						>
							<Settings2 className="h-4 w-4" />
							<span>Свой код</span>
						</button>

						<button
							type="submit"
							disabled={shortenMutation.isPending || !url.trim()}
							className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{shortenMutation.isPending ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Sparkles className="h-4 w-4" />
							)}
							<span>Сократить</span>
						</button>
					</div>
				</div>

				{/* Дополнительное поле для кастомного алиаса */}
				{showCustomCode && (
					<div className="flex items-center rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2 text-xs">
						<span className="font-mono text-slate-500 mr-1.5">/</span>
						<input
							type="text"
							value={customCode}
							onChange={(e) => setCustomCode(e.target.value)}
							placeholder="ваш-слаг (3-20 символов)"
							maxLength={20}
							className="flex-1 bg-transparent font-mono text-white placeholder-slate-600 focus:outline-none"
						/>
					</div>
				)}
			</form>

			{/* Ошибка */}
			{errorMessage && (
				<div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
					<AlertCircle className="h-4 w-4 shrink-0" />
					<span>{errorMessage}</span>
				</div>
			)}

			{/* Результат */}
			{lastResult && lastResult.shortUrl && (
				<div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 backdrop-blur-sm">
					<div className="min-w-0 flex-1 pr-4">
						<span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
							Ссылка готова
						</span>
						<p className="truncate text-sm font-semibold text-white">
							{lastResult.shortUrl}
						</p>
					</div>

					<div className="flex items-center gap-1.5">
						<button
							type="button"
							onClick={() => handleCopy(lastResult.shortUrl)}
							className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-500"
						>
							{copied ? (
								<>
									<Check className="h-3.5 w-3.5" />
									<span>Скопировано</span>
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
							className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
							title="Открыть в новой вкладке"
						>
							<ExternalLink className="h-4 w-4" />
						</a>
					</div>
				</div>
			)}
		</div>
	);
}
