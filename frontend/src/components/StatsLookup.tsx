import { BarChart3, Calendar, ExternalLink, Globe, Search } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { useGetUrlStats } from '../api/hooks';

export function StatsLookup() {
	const [inputCode, setInputCode] = useState('');
	const [searchedCode, setSearchedCode] = useState('');

	const { data, isLoading, isError } = useGetUrlStats(searchedCode, {
		enabled: Boolean(searchedCode),
		retry: false,
	});

	const stats = data?.data;
	const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';

	const handleSearch = (e: FormEvent) => {
		e.preventDefault();
		const clean = inputCode.trim().replace(/^https?:\/\/[^/]+\//, '').replace(/^\//, '');
		if (clean) {
			setSearchedCode(clean);
		}
	};

	return (
		<div className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-sm sm:p-8">
			<div className="mb-6">
				<h3 className="text-lg font-bold text-white sm:text-xl">
					Аналитика ссылки
				</h3>
				<p className="text-xs text-slate-400">
					Введите короткий код или ссылку, чтобы узнать количество переходов
				</p>
			</div>

			<form onSubmit={handleSearch} className="mb-6 flex gap-2">
				<div className="relative flex-1">
					<Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
					<input
						type="text"
						value={inputCode}
						onChange={(e) => setInputCode(e.target.value)}
						placeholder="Введите код (например, custom-link)"
						className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-2.5 pl-10 pr-4 text-xs font-mono text-white placeholder-slate-500 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
					/>
				</div>

				<button
					type="submit"
					disabled={!inputCode.trim()}
					className="rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
				>
					Найти
				</button>
			</form>

			{isLoading && (
				<div className="flex h-24 items-center justify-center">
					<div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
				</div>
			)}

			{isError && (
				<div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-center text-xs text-rose-400">
					Ссылка с кодом <code className="font-mono font-bold">"{searchedCode}"</code> не найдена.
				</div>
			)}

			{stats && (
				<div className="grid gap-4 sm:grid-cols-3">
					<div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
						<div className="flex items-center gap-2 text-slate-400">
							<BarChart3 className="h-4 w-4 text-indigo-400" />
							<span className="text-xs">Всего переходов</span>
						</div>
						<p className="mt-2 text-2xl font-bold text-white">
							{stats.clicks}
						</p>
					</div>

					<div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
						<div className="flex items-center gap-2 text-slate-400">
							<Globe className="h-4 w-4 text-violet-400" />
							<span className="text-xs">Короткий код</span>
						</div>
						<p className="mt-2 font-mono text-sm font-semibold text-indigo-400">
							/{stats.short_code}
						</p>
						<a
							href={`${baseUrl}/${stats.short_code}`}
							target="_blank"
							rel="noopener noreferrer"
							className="mt-1 inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
						>
							<span>Открыть</span>
							<ExternalLink className="h-3 w-3" />
						</a>
					</div>

					<div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
						<div className="flex items-center gap-2 text-slate-400">
							<Calendar className="h-4 w-4 text-emerald-400" />
							<span className="text-xs">Дата создания</span>
						</div>
						<p className="mt-2 text-xs font-medium text-slate-200">
							{stats.created_at ? new Date(stats.created_at).toLocaleString('ru-RU') : '—'}
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
