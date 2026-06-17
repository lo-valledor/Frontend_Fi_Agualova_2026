/* eslint-disable no-empty-pattern */
import { lazy, Suspense } from 'react';

import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { DataTableSkeleton } from '~/components/skeletons';
import { administracionService } from '~/services/administracionService';

import type { Route } from './+types/medidores';

// Lazy load del componente pesado (54 KB)
const MedidoresComponent = lazy(
  () => import('~/components/administracion/medidores/medidores-component')
);

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Agualova | Medidores' },
    { name: 'description', content: 'Medidores' }
  ];
}

export async function clientLoader() {
  const result = await administracionService.getMedidoresData();

  if (result.error || !result.data) {
    return {
      medidores: [],
      marcas: []
    };
  }

  return result.data;
}

export default function Medidores({ loaderData }: Route.ComponentProps) {
  const { medidores, marcas } = loaderData;
  const pageBreadcrumbs = [{ label: 'Administracion' }, { label: 'Medidores' }];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <Suspense fallback={<DataTableSkeleton columns={6} />}>
        <MedidoresComponent medidores={medidores} marcas={marcas} />
      </Suspense>
    </div>
  );
}

export function hydrateFallback() {
  return <DataTableSkeleton columns={6} />;
}
