import { ReporteHydrateFallback } from '../../../components/reportes/reporte-hydrate-fallback';
import UnderConstruction from '../../../components/under-construction';
import type { Route } from './+types/roles-permisos';

export function meta(_args: Route.MetaArgs) {
  return [
    {
      title: 'Enerlova | Roles y Permisos',
      description: 'Esta sección está en construcción.',
    },
  ];
}

export default function RolesPermisos() {
  return (
    <UnderConstruction
      title='Roles y Permisos'
      description='Esta sección está en construcción.'
    />
  );
}

export function hydrateFallback() {
  return <ReporteHydrateFallback />;
}
