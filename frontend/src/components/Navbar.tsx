import { BookOpen, CheckCircle2, Link2 } from 'lucide-react';
import { useGetHealthStatus } from '../api/hooks';

export function Navbar() {
	const { data: health } = useGetHealthStatus({
		refetchInterval: 30000,
	});

	const backendDocsUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/docs`;

	return (
		<header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/20">
						<Link2 className="h-5 w-5 text-white" />
					</div>
					<div>
						<h1 className="text-lg font-bold text-white tracking-tight">URL Shortener</h1>
						<p className="text-xs text-slate-400">CQRS + Redis Cache + Orval TS</p>
					</div>
				</div>

				<div className="flex items-center gap-3">
					{health && (
						<div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
							<span className="relative flex h-2 w-2">
								<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
								<span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
							</span>
							<CheckCircle2 className="h-3.5 w-3.5" />
							<span>БД & Redis Online</span>
						</div>
					)}

					<a
						href={backendDocsUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-700 hover:text-white"
					>
						<BookOpen className="h-3.5 w-3.5 text-indigo-400" />
						<span>Swagger /docs</span>
					</a>
				</div>
			</div>
		</header>
	);
}
