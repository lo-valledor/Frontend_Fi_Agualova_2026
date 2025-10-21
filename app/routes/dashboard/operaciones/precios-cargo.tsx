/* eslint-disable no-empty-pattern */
import { lazy, Suspense } from 'react';

import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { DataTableSkeleton } from '~/components/skeletons';
import { operacionesService } from '~/services/operacionesService';

import type { Route } from './+types/precios-cargo';

// Lazy load del componente pesado (42 KB)
const PreciosCargoComponent = lazy(() =>
  import('~/components/operaciones/precios-cargo/precios-cargo-component')
);

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Precios de Cargo' },
    { name: 'description', content: 'Precios de Cargo' }
  ];
}

const currentDate = new Date();
const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
const currentYear = currentDate.getFullYear().toString();

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  const mes = url.searchParams.get('mes') || currentMonth;
  const anio = url.searchParams.get('anio') || currentYear;

  const result = await operacionesService.getPreciosCargoData(mes, anio);

  if (result.error || !result.data) {
    return {
      tablaEnel: [],
      tablaEnerlova: [],
      initialMes: currentMonth,
      initialAnio: currentYear,
      error: 'Error al cargar los datos'
    };
  }

  return {
    tablaEnel: result.data.tablaEnel,
    tablaEnerlova: result.data.tablaEnerlova,
    initialMes: mes,
    initialAnio: anio,
    error: null
  };
}

export default function PreciosCargo({ loaderData }: Route.ComponentProps) {
  const pageBreadcrumbs = [
    { label: 'Operaciones' },
    { label: 'Precios de Cargo' }
  ];

  return (
    <div className='min-h-screen'>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <Suspense fallback={<DataTableSkeleton columns={8} rows={12} />}>
        <PreciosCargoComponent {...loaderData} />
      </Suspense>
    </div>
  );
}

export function hydrateFallback() {
  return <DataTableSkeleton columns={8} rows={12} />;
}
