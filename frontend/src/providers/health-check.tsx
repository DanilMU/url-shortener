import { ConstructionIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useGetHealthStatus } from '../api/hooks';

interface HealthCheckProviderProps {
	children: ReactNode;
}

export function HealthCheckProvider({ children }: HealthCheckProviderProps) {
	const { data, isLoading, isError } = useGetHealthStatus({
		retry: 1,
		refetchOnWindowFocus: false,
	});

	if (isLoading) {
		return (
			<div className="flex h-screen w-full items-center justify-center bg-slate-950 text-slate-100">
				<div className="flex flex-col items-center gap-3">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
					<p className="text-sm text-slate-400">Проверка доступности сервиса...</p>
				</div>
			</div>
		);
	}

	if (isError || data?.status?.toLowerCase() !== 'ok') {
		return (
			<div className="flex h-screen w-full flex-col items-center justify-center bg-slate-950 p-4 text-center text-slate-100">
				<ConstructionIcon className="mb-6 h-16 w-16 text-rose-500" />
				<h1 className="mb-3 text-3xl font-bold">Сервис временно недоступен</h1>
				<p className="max-w-md text-sm text-slate-400">
					Не удалось установить соединение с сервером бэкенда или базой данных. Убедитесь, что бэкенд и контейнеры запущены.
				</p>
			</div>
		);
	}

	return <>{children}</>;
}
