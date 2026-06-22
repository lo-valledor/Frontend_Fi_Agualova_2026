/* eslint-disable no-empty-pattern */
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import RevisarCalculoFacturaComponent from '~/components/operaciones/revisar-calculo-factura/revisar-calculo-factura-component';
import { operacionesService } from '~/services/operacionesService';
import type {
  RevisarCalculosFiltrosCiclosResponse,
  RevisarCalculosFiltrosPeriodosResponse
} from '~/types/operaciones';

import type { Route } from './+types/revisar-calculo-factura';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Agualova | Revisar Cálculo de Factura' },
    { name: 'description', content: 'Revisar Cálculo de Factura' }
  ];
}

interface RevisarCalculoFacturaLoaderData {
  periodos: RevisarCalculosFiltrosPeriodosResponse;
  ciclos: RevisarCalculosFiltrosCiclosResponse;
  error: string | null;
}

export async function clientLoader({}: Route.ClientLoaderArgs) {
  const result = await operacionesService.getRevisarCalculosData();

  if (result.error || !result.data) {
    return {
      periodos: [],
      ciclos: [],
      error: 'Error al cargar los datos de revisión de cálculo'
    } satisfies RevisarCalculoFacturaLoaderData;
  }

  return {
    periodos: result.data.filtrosPeriodos,
    ciclos: result.data.filtrosCiclos,
    error: null
  } satisfies RevisarCalculoFacturaLoaderData;
}

export default function RevisarCalculoFactura({
  loaderData
}: Route.ComponentProps) {
  const { periodos, ciclos, error } = loaderData;

  const pageBreadcrumbs = [
    { label: 'Operaciones' },
    { label: 'Revisar Cálculo de Factura' }
  ];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <RevisarCalculoFacturaComponent
        periodos={periodos}
        ciclos={ciclos}
        error={error}
      />
    </div>
  );
}