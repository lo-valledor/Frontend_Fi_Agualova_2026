/* eslint-disable no-empty-pattern */
import { lazy, Suspense } from 'react';

import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { DataTableSkeleton } from '~/components/skeletons';
import { administracionService } from '~/services/administracionService';

import type { Route } from './+types/medidores';

const MedidoresComponent = lazy(
  () => import('~/components/administracion/medidores/medidores-component')
);

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Agualova | Medidores' },
    { name: 'description', content: 'Medidores' }
  ];
}

export async function clientLoader() {
  const result = await administracionService.getMedidoresData();

  if (result.error || !result.data) {
    return {
      medidores: []
    };
  }

  return {
    medidores: result.data.medidores
  };
}

export default function Medidores({ loaderData }: Route.ComponentProps) {
  const { medidores } = loaderData;
  const pageBreadcrumbs = [{ label: 'Administracion' }, { label: 'Medidores' }];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <Suspense fallback={<DataTableSkeleton columns={6} />}>
        <MedidoresComponent medidores={medidores} />
      </Suspense>
    </div>
  );
}

export function hydrateFallback() {
  return <DataTableSkeleton columns={6} />;
}
