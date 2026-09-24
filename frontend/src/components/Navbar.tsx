import { Link2, Menu } from 'lucide-react';

interface NavbarProps {
	onOpenMenu: () => void;
}

export function Navbar({ onOpenMenu }: NavbarProps) {
	return (
		<header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
				<div className="flex items-center gap-3">
					<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/25">
						<Link2 className="h-5 w-5 text-white" />
					</div>
					<span className="text-base font-bold tracking-tight text-white">URL Shortener</span>
				</div>

				<button
					type="button"
					onClick={onOpenMenu}
					className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs font-medium text-slate-200 transition-all hover:border-slate-700 hover:bg-slate-800 hover:text-white"
					title="Открыть меню"
				>
					<Menu className="h-4 w-4 text-indigo-400" />
					<span className="hidden sm:inline">История и Аналитика</span>
				</button>
			</div>
		</header>
	);
}
