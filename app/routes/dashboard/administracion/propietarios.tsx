import { useRouteError } from 'react-router';
import ContractHydrateFallback from '~/components/administracion/contratos/contract-hydrate-fallback';
import PropietariosComponent from '~/components/administracion/propietarios/propietarios-component';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { ErrorBoundary as ErrorBoundaryComponent } from '~/components/error-boundary';
import { administracionService } from '~/services/administracionService';
import type { PropietariosRow } from '~/types/administracion';
import type { Route } from './+types/propietarios';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Agualova | Propietarios' },
    { name: 'description', content: 'Propietarios' }
  ];
}

export async function clientLoader(_args: Route.ClientActionArgs) {
  const result = await administracionService.getPropietarioByRut();

  if (result.error || !result.data) {
    throw new Response('Error al cargar los propietarios', { status: 500 });
  }

  const propietarios = Array.isArray(result.data)
    ? result.data
    : Array.isArray((result.data as { data?: unknown[] }).data)
      ? (result.data as { data: PropietariosRow[] }).data
      : [];

  return { propietarios };
}

export default function Propietarios({
  loaderData
}: Readonly<Route.ComponentProps>) {
  const { propietarios } = loaderData;
  const pageBreadcrumbs = [
    { label: 'Administracion' },
    { label: 'Propietarios' }
  ];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <PropietariosComponent propietarios={propietarios} />
    </div>
  );
}

export function hydrateFallback() {
  return <ContractHydrateFallback />;
}

export function ErrorBoundary() {
  const error = useRouteError() as Error;
  return <ErrorBoundaryComponent error={error} />;
}
