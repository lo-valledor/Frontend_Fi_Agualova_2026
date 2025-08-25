/* eslint-disable no-empty-pattern */
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import EmpalmesComponent from '~/components/mantencion/empalmes/empalmes-component';
import { MantencionHydrateFallback } from '~/components/mantencion/mantencion-hydrate-fallback';
import { mantencionService } from '~/services/mantencionService';

import type { Route } from './+types/empalmes';

export function hydrateFallback() {
  return <MantencionHydrateFallback />;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Empalmes' },
    { name: 'description', content: ' empalmes del sistema' }
  ];
}

export async function clientLoader() {
  const result = await mantencionService.getEmpalmes();

  if (result.error || !result.data) {
    return { empalmes: [] };
  }

  return { empalmes: result.data };
}

export default function Empalmes({ loaderData }: Route.ComponentProps) {
  const { empalmes } = loaderData;

  const pageBreadcrumbs = [{ label: 'Mantención' }, { label: 'Empalmes' }];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <EmpalmesComponent empalmes={empalmes} />
    </div>
  );
}
