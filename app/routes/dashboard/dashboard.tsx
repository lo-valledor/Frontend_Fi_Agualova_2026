import DashboardComponent from '~/components/dashboard/dashboard-component';
import HydrateFallback from '~/components/hydrate-fallback';
import { monitorService } from '~/services';
import type { Route } from './+types/dashboard';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Agualova | Inicio' },
    { name: 'description', content: 'Dashboard' }
  ];
}

export async function clientLoader() {
  const result = await monitorService.getPeriodos();

  if (!result.data || result.error) {
    throw new Error('Failed to load periodos');
  }

  return { periodos: result.data };
}

export default function DashboardPage({ loaderData }: Route.ComponentProps) {
  return <DashboardComponent periodos={loaderData.periodos} />;
}

export function hydrateFallback() {
  return <HydrateFallback />;
}
