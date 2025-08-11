/* eslint-disable no-empty-pattern */
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { MantencionHydrateFallback } from '~/components/mantencion/mantencion-hydrate-fallback';
import TarifasComponent from '~/components/mantencion/tarifas/tarifas-component';
import { mantencionService } from '~/services/mantencionService';

import type { Route } from './+types/tarifas';

export function hydrateFallback() {
  return <MantencionHydrateFallback />;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Tarifas' },
    { name: 'description', content: ' Tarifas del sistema' },
  ];
}

export async function clientLoader() {
  const result = await mantencionService.getTarifas();

  if (result.error || !result.data) {
    return { tarifas: [] };
  }

  return { tarifas: result.data };
}

export default function Tarifas({ loaderData }: Readonly<Route.ComponentProps>) {
  const { tarifas } = loaderData;

  const pageBreadcrumbs = [{ label: 'Mantención' }, { label: 'Tarifas' }];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <TarifasComponent tarifas={tarifas} />
    </div>
  );
}
