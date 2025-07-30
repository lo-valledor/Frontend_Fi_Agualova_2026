import { ReporteHydrateFallback } from '~/components/reportes/reporte-hydrate-fallback';
import UnderConstruction from '~/components/under-construction';

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

export default function ResumenFacturacion() {
  return (
    <UnderConstruction
      title='Resumen de Facturación'
      description='Estamos desarrollando un sistema completo de reportes de facturación con análisis detallados y estadísticas avanzadas.'
    />
  );
}

export function hydrateFallback() {
  return <ReporteHydrateFallback />;
}
