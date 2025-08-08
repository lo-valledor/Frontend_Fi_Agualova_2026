/* eslint-disable no-empty-pattern */
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { ReporteHydrateFallback } from '~/components/reportes/reporte-hydrate-fallback';
import ResumenFacturacionComponent from '~/components/reportes/resumen-facturacion/resumen-facturacion-component';
import { reportesService } from '~/services/reportesService';

import type { Route } from './+types/resumen-facturacion';

export function meta(_args: Route.MetaArgs) {
  return [
    {
      title: 'Enerlova | Resumen de Facturación',
      description:
        'reporte de facturación con análisis detallados y estadísticas avanzadas.',
    },
  ];
}

export async function clientLoader({}: Route.ClientLoaderArgs) {
  const result = await reportesService.getResumenFacturacion();

  if (result.error || !result.data) {
    return {
      comboEmpalmes: [],
      periodosFacturacion: [],
      error: new Error(result.error || 'Error al cargar datos'),
    };
  }

  return {
    comboEmpalmes: result.data.comboEmpalmes,
    periodosFacturacion: result.data.periodosFacturacion,
    error: null,
  };
}

export default function ResumenFacturacion({
  loaderData,
}: Route.ComponentProps) {
  const pageBreadcrumbs = [
    { label: 'Reportes' },
    { label: 'Resumen de Facturación' },
  ];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <ResumenFacturacionComponent {...loaderData} />
    </div>
  );
}

export function hydrateFallback() {
  return <ReporteHydrateFallback />;
}
