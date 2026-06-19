/* eslint-disable no-empty-pattern */
import { lazy, Suspense } from 'react';

import { MonitorLecturasSkeleton } from '~/components/skeletons';
import { monitorService } from '~/services/monitorService';

import type { Route } from './+types/monitor-lecturas';

const MonitorLecturasComponent = lazy(
  () => import('~/components/monitor/monitor-lecturas-component')
);

export function hydrateFallback() {
  return <MonitorLecturasSkeleton />;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Agualova | Monitor Lecturas' },
    { name: 'description', content: 'Monitoreo de lecturas de medidores' }
  ];
}

export async function clientLoader() {
  const result = await monitorService.getBasicData();

  if (result.error || !result.data) {
    return {
      periodos: [],
      sectores: [],
      claves: [],
      activePeriodoId: null,
      error: new Error(result.error || 'Error al cargar datos')
    };
  }

  return {
    periodos: result.data.periodos,
    sectores: result.data.sectores,
    claves: result.data.claves,
    activePeriodoId: result.data.activePeriodoId,
    error: null
  };
}

export default function MonitorLecturasPage({
  loaderData
}: Route.ComponentProps) {
  return (
    <Suspense fallback={<MonitorLecturasSkeleton />}>
      <MonitorLecturasComponent {...loaderData} />
    </Suspense>
  );
}
