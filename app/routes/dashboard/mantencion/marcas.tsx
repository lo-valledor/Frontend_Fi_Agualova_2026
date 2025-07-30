/* eslint-disable no-empty-pattern */
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { MantencionHydrateFallback } from '~/components/mantencion/mantencion-hydrate-fallback';
import MarcasComponent from '~/components/mantencion/marcas/marcas-component';
import { mantencionService } from '~/services/mantencionService';

import type { Route } from './+types/marcas';

export function hydrateFallback() {
  return <MantencionHydrateFallback />;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Marcas' },
    { name: 'description', content: ' marcas del sistema' },
  ];
}

export async function clientLoader() {
  const result = await mantencionService.getMarcas();

  if (result.error || !result.data) {
    return { marcas: [] };
  }

  return { marcas: result.data };
}

export default function Marcas({ loaderData }: Route.ComponentProps) {
  const { marcas } = loaderData;

  const pageBreadcrumbs = [{ label: 'Mantención' }, { label: 'Marcas' }];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <MarcasComponent marcas={marcas} />
    </div>
  );
}
