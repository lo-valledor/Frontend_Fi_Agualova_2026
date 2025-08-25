/* eslint-disable no-empty-pattern */
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import ConsultarContratoComponent from '~/components/reportes/consultar-contrato/consultar-contrato-component';
import { ReporteHydrateFallback } from '~/components/reportes/reporte-hydrate-fallback';
import { reportesService } from '~/services/reportesService';

import type { Route } from './+types/consultar-contrato';

export function meta(_args: Route.MetaArgs) {
  return [
    {
      title: 'Enerlova | Consultar Contrato',
      description:
        'Próximamente podrás consultar y revisar todos los detalles de los contratos de manera rápida y eficiente.'
    }
  ];
}

export async function clientLoader({}: Route.ClientLoaderArgs) {
  const result = await reportesService.getBuscarContrato();

  if (result.error || !result.data) {
    return {
      buscarContratos: [],
      error: new Error(result.error || 'Error al cargar datos')
    };
  }

  return {
    buscarContratos: result.data.buscarContratos,
    error: null
  };
}

export default function ConsultarContrato({
  loaderData
}: Readonly<Route.ComponentProps>) {
  const pageBreadcrumbs = [
    { label: 'Reportes' },
    { label: 'Consulta de Contratos' }
  ];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <ConsultarContratoComponent {...loaderData} />
    </div>
  );
}

export function hydrateFallback() {
  return <ReporteHydrateFallback />;
}
