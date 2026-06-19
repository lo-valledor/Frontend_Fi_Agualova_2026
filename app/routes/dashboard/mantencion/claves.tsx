/* eslint-disable no-empty-pattern */
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import ClavesComponent from '~/components/mantencion/claves/claves-component';
import { MantencionHydrateFallback } from '~/components/mantencion/mantencion-hydrate-fallback';
import { mantencionService } from '~/services/mantencionService';

import type { Route } from './+types/claves';

export function hydrateFallback() {
  return <MantencionHydrateFallback />;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Agualova | Claves' },
    { name: 'description', content: ' claves del sistema' }
  ];
}

export async function clientLoader() {
  const result = await mantencionService.getClaves();

  if (result.error || !result.data) {
    return { claves: [] };
  }

  return { claves: result.data };
}

export default function Claves({ loaderData }: Route.ComponentProps) {
  const { claves } = loaderData;

  const pageBreadcrumbs = [{ label: 'Mantención' }, { label: 'Claves' }];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <ClavesComponent claves={claves} />
    </div>
  );
}
