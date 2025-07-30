/* eslint-disable no-empty-pattern */
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { MantencionHydrateFallback } from '~/components/mantencion/mantencion-hydrate-fallback';
import ZonasComponent from '~/components/mantencion/zonas/zonas-component';
import { mantencionService } from '~/services/mantencionService';

import type { Route } from './+types/zonas';

export function hydrateFallback() {
  return <MantencionHydrateFallback />;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Zonas' },
    { name: 'description', content: ' zonas del sistema' },
  ];
}

export async function clientLoader() {
  const result = await mantencionService.getZonas();

  if (result.error || !result.data) {
    return { zonas: [] };
  }

  return { zonas: result.data };
}

export default function Zonas({ loaderData }: Route.ComponentProps) {
  const { zonas } = loaderData;

  const pageBreadcrumbs = [{ label: 'Mantención' }, { label: 'Zonas' }];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <ZonasComponent zonas={zonas} />
    </div>
  );
}
