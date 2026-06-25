import NotaDeCobroComponent from '~/components/reportes/nota-de-cobro/nota-de-cobro-component';
import { ReporteHydrateFallback } from '~/components/reportes/reporte-hydrate-fallback';
import { reportesService } from '~/services/reportesService';
import type { Route } from './+types/nota-de-cobro';

export function meta(_args: Route.MetaArgs) {
  return [
    {
      title: 'Agualova | Nota de Cobro',
      description:
        'Próximamente tendrás acceso a un visor completo de facturas con opciones de búsqueda, filtros y exportación.'
    }
  ];
}

export async function clientLoader() {
  const [resPeriodos, resEmpalmes] = await Promise.all([
    reportesService.getListadoPeriodos(),
    reportesService.getListadoEmpalmes()
  ]);

  return {
    periodos: resPeriodos.data ?? [],
    empalmes: resEmpalmes.data ?? [],
    error: resPeriodos.error ?? resEmpalmes.error
  };
}

export default function NotaDeCobro({ loaderData }: Route.ComponentProps) {
  return <NotaDeCobroComponent {...loaderData} />;
}

export function hydrateFallback() {
  return <ReporteHydrateFallback />;
}
