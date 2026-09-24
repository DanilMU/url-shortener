import { useState } from 'react';
import { Drawer, Navbar, ShortenCard } from './components';
import { HealthCheckProvider, ReactQueryProvider } from './providers';

export function AppContent() {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	return (
		<div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500/30">
			<Navbar onOpenMenu={() => setIsDrawerOpen(true)} />

			<main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
				<div className="w-full max-w-2xl space-y-6">
					<div>
						<h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
							Сокращайте ссылки в один клик
						</h1>
						<p className="mt-3 text-sm text-slate-400">
							Быстрые и надежные короткие ссылки с моментальным переходом
						</p>
					</div>

					<ShortenCard />
				</div>
			</main>

			<footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
				<p>URL Shortener &bull; Express + PostgreSQL + Redis + React</p>
			</footer>

			<Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
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
