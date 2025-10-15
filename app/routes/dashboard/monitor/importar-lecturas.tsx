/* eslint-disable no-empty-pattern */
import { MonitorHydrateFallback } from '~/components/monitor/monitor-hydrate-fallback';

import type { Route } from './+types/importar-lecturas';
import ImportarLecturasComponent from '~/components/monitor/importar-lecturas/importar-lecturas-component';

export function hydrateFallback() {
  return <MonitorHydrateFallback />;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Exportar Lecturas' },
    { name: 'description', content: 'Exportar lecturas de medidores' }
  ];
}

export default function ImportarLecturas() {
  return <ImportarLecturasComponent />;
}
