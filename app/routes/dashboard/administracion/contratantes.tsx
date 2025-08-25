import React from 'react';
import type { Route } from './+types/contratantes';
import ContractHydrateFallback from '~/components/administracion/contratos/contract-hydrate-fallback';
import { ErrorBoundary as ErrorBoundaryComponent } from '~/components/error-boundary';
import { useRouteError } from 'react-router';
import { administracionService } from '~/services';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import ContratantesComponent from '~/components/administracion/contratantes/contratantes-component';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Contratantes' },
    { name: 'description', content: 'Contratantes' }
  ];
}

export async function clientLoader(_args: Route.ClientActionArgs) {
  const result = await administracionService.getContratantesData();

  if (result.error || !result.data) {
    throw new Response('Error al cargar los contratantes', { status: 500 });
  }

  return result.data;
}

export default function Contratantes({
  loaderData
}: Readonly<Route.ComponentProps>) {
  const { contratantes, comunas, giros } = loaderData;
  const pageBreadcrumbs = [
    { label: 'Administracion' },
    { label: 'Contratantes' }
  ];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <ContratantesComponent
        contratantes={contratantes}
        comunas={comunas}
        giros={giros}
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