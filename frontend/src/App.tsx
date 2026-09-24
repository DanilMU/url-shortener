import { Navbar, RecentUrlsTable, ShortenCard, StatsLookup } from './components';
import { HealthCheckProvider, ReactQueryProvider } from './providers';

export function AppContent() {
	return (
		<div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
			<Navbar />

			<main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
				<div className="grid gap-8 lg:grid-cols-12">
					<div className="lg:col-span-7 space-y-8">
						<ShortenCard />
						<RecentUrlsTable />
					</div>

					<div className="lg:col-span-5 space-y-8">
						<StatsLookup />

						<div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
							<h4 className="text-sm font-semibold text-white mb-2">
								Архитектура проекта
							</h4>
							<p className="text-xs text-slate-400 leading-relaxed mb-4">
								Построено по стандартам microservices из <span className="text-indigo-400 font-medium">StackCine</span>:
							</p>
							<ul className="space-y-2 text-xs text-slate-300">
								<li className="flex items-center gap-2">
									<span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
									<span><strong>CQRS-lite:</strong> сырые SQL queries/commands</span>
								</li>
								<li className="flex items-center gap-2">
									<span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
									<span><strong>Redis Cache:</strong> Cache-Aside TTL 1 час</span>
								</li>
								<li className="flex items-center gap-2">
									<span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
									<span><strong>Orval Codegen:</strong> сквозная TS-типизация API</span>
								</li>
								<li className="flex items-center gap-2">
									<span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
									<span><strong>Fail-Fast Env:</strong> Zod-валидация конфигурации</span>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</main>

			<footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
				<p>URL Shortener MVP &bull; Ivan Kulyasov &bull; Express + PostgreSQL + Redis + React + Vite</p>
			</footer>
		</div>
	);
}

export default function App() {
	return (
		<ReactQueryProvider>
			<HealthCheckProvider>
				<AppContent />
			</HealthCheckProvider>
		</ReactQueryProvider>
	);
}
