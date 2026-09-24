import { BarChart3, BookOpen, CheckCircle2, History, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useGetHealthStatus } from '../api/hooks';
import { RecentUrlsTable } from './RecentUrlsTable';
import { StatsLookup } from './StatsLookup';

interface DrawerProps {
	isOpen: boolean;
	onClose: () => void;
}

export function Drawer({ isOpen, onClose }: DrawerProps) {
	const [activeTab, setActiveTab] = useState<'recent' | 'stats'>('recent');
	const { data: health } = useGetHealthStatus();

	const backendDocsUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/docs`;

	// Закрытие по ESC
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		if (isOpen) {
			window.addEventListener('keydown', handleKeyDown);
			document.body.style.overflow = 'hidden';
		}
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			document.body.style.overflow = '';
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex justify-end">
			{/* Backdrop */}
			<div
				role="button"
				tabIndex={0}
				aria-label="Закрыть меню"
				onClick={onClose}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') onClose();
				}}
				className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
			/>

			{/* Slide-over panel */}
			<div className="relative z-10 flex h-full w-full max-w-lg flex-col border-l border-slate-800 bg-slate-950 p-6 shadow-2xl transition-transform sm:p-8">
				{/* Top bar */}
				<div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
					<div className="flex items-center gap-1 rounded-xl bg-slate-900 p-1 border border-slate-800">
						<button
							type="button"
							onClick={() => setActiveTab('recent')}
							className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
								activeTab === 'recent'
									? 'bg-indigo-600 text-white shadow'
									: 'text-slate-400 hover:text-white'
							}`}
						>
							<History className="h-3.5 w-3.5" />
							<span>История ссылок</span>
						</button>

						<button
							type="button"
							onClick={() => setActiveTab('stats')}
							className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
								activeTab === 'stats'
									? 'bg-indigo-600 text-white shadow'
									: 'text-slate-400 hover:text-white'
							}`}
						>
							<BarChart3 className="h-3.5 w-3.5" />
							<span>Аналитика</span>
						</button>
					</div>

					<button
						type="button"
						onClick={onClose}
						className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
						title="Закрыть (Esc)"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto py-6">
					{activeTab === 'recent' ? <RecentUrlsTable /> : <StatsLookup />}
				</div>

				{/* Footer inside drawer */}
				<div className="border-t border-slate-800/80 pt-4 flex items-center justify-between text-xs text-slate-400">
					<div className="flex items-center gap-2">
						{health && (
							<div className="flex items-center gap-1.5 text-emerald-400">
								<CheckCircle2 className="h-3.5 w-3.5" />
								<span>БД & Redis Online</span>
							</div>
						)}
					</div>

					<a
						href={backendDocsUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors"
					>
						<BookOpen className="h-3.5 w-3.5" />
						<span>Swagger /docs</span>
					</a>
				</div>
			</div>
		</div>
	);
}
