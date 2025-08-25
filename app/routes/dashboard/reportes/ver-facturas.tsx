import { ReporteHydrateFallback } from '~/components/reportes/reporte-hydrate-fallback';
import UnderConstruction from '~/components/under-construction';

import type { Route } from './+types/ver-facturas';

export function meta(_args: Route.MetaArgs) {
  return [
    {
      title: 'Enerlova | Ver Facturas',
      description:
        'Próximamente tendrás acceso a un visor completo de facturas con opciones de búsqueda, filtros y exportación.'
    }
  ];
}

export default function VerFacturas() {
  return (
    <UnderConstruction
      title='Ver Facturas'
      description='Próximamente tendrás acceso a un visor completo de facturas con opciones de búsqueda, filtros y exportación.'
    />
  );
}

export function hydrateFallback() {
  return <ReporteHydrateFallback />;
}
