import { ReporteHydrateFallback } from '~/components/reportes/reporte-hydrate-fallback';
import UnderConstruction from '~/components/under-construction';

import type { Route } from './+types/consultar-contrato';

export function meta(_args: Route.MetaArgs) {
  return [
    {
      title: 'Enerlova | Consultar Contrato',
      description:
        'Próximamente podrás consultar y revisar todos los detalles de los contratos de manera rápida y eficiente.',
    },
  ];
}

export default function ConsultarContrato() {
  return (
    <UnderConstruction
      title='Consultar Contrato'
      description='Próximamente podrás consultar y revisar todos los detalles de los contratos de manera rápida y eficiente.'
    />
  );
}

export function hydrateFallback() {
  return <ReporteHydrateFallback />;
}
