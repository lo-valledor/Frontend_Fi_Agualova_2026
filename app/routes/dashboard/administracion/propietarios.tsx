import React from 'react';
import type { Route } from './+types/propietarios';
import ContractHydrateFallback from '~/components/administracion/contratos/contract-hydrate-fallback';
import { ErrorBoundary as ErrorBoundaryComponent } from '~/components/error-boundary';
import { useRouteError } from 'react-router';
import { administracionService } from '~/services/administracionService';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import PropietariosComponent from '~/components/administracion/propietarios/propietarios-component';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Propietarios' },
    { name: 'description', content: 'Propietarios' }
  ];
}

export async function clientLoader(_args: Route.ClientActionArgs) {
  const result = await administracionService.getPropietariosData();

  if (result.error || !result.data) {
    throw new Response('Error al cargar los clientes', { status: 500 });
  }

  return result.data;
}

export default function Propietarios({
  loaderData
}: Readonly<Route.ComponentProps>) {
  const { propietarios, contratante } = loaderData;
  const pageBreadcrumbs = [
    { label: 'Administracion' },
    { label: 'Propietarios' }
  ];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <PropietariosComponent
        propietarios={propietarios}
        contratantes={contratante}
      />
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
