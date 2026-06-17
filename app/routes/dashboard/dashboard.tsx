/* eslint-disable no-empty-pattern */
import DashboardComponent from '~/components/dashboard/dashboard-component';
import HydrateFallback from '~/components/hydrate-fallback';

import type { Route } from './+types/dashboard';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Agualova | Inicio' },
    { name: 'description', content: 'Dashboard' }
  ];
}

export async function clientLoader() {
  return null;
}

export default function DashboardPage() {
  return <DashboardComponent />;
}

export function hydrateFallback() {
  return <HydrateFallback />;
}
