import { ReporteHydrateFallback } from '~/components/reportes/reporte-hydrate-fallback';
import VerFacturasComponent from '~/components/reportes/ver-facturas/ver-facturas-component';
import { reportesService } from '~/services/reportesService';
import type { Route } from './+types/ver-facturas';

export function meta(_args: Route.MetaArgs) {
  return [
    {
      title: 'Agualova | Ver Facturas',
      description:
        'Próximamente tendrás acceso a un visor completo de facturas con opciones de búsqueda, filtros y exportación.'
    }
  ];
}

export async function clientLoader() {
  const resPeriodos = await reportesService.getListadoPeriodos();

  return {
    periodos: resPeriodos.data ?? [],
    error: resPeriodos.error
  };
}

export default function VerFacturas({ loaderData }: Route.ComponentProps) {
  return <VerFacturasComponent {...loaderData} />;
}

export function hydrateFallback() {
  return <ReporteHydrateFallback />;
}
