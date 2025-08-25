/* eslint-disable no-empty-pattern */
import { useRouteError } from 'react-router';

import ContractHydrateFallback from '~/components/administracion/contratos/contract-hydrate-fallback';
import ContratosComponent from '~/components/administracion/contratos/contratos-component';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { ErrorBoundary as ErrorBoundaryComponent } from '~/components/error-boundary';
import { administracionService } from '~/services/administracionService';

import type { Route } from './+types/contratos';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Contratos' },
    { name: 'description', content: 'Contratos' }
  ];
}

export async function clientLoader({}: Route.ClientActionArgs) {
  const result = await administracionService.getContratosData();

  if (result.error || !result.data) {
    return {
      contratos: []
    };
  }

  return result.data;
}

export default function Contratos({ loaderData }: Readonly<Route.ComponentProps>) {
  const { contratos } = loaderData;
  const pageBreadcrumbs = [{ label: 'Administracion' }, { label: 'Contratos' }];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <ContratosComponent contratos={contratos} />
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
