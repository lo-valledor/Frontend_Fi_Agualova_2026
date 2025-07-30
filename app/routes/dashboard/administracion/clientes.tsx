import React from 'react';

import { AdministracionHydrateFallback } from '~/components/administracion/administracion-hydrate-fallback';
import ClientesComponent from '~/components/administracion/clientes/clientes-component';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { administracionService } from '~/services/administracionService';

import type { Route } from './+types/clientes';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Clientes' },
    { name: 'description', content: 'Clientes' },
  ];
}

export async function clientLoader(_args: Route.ClientActionArgs) {
  const result = await administracionService.getClientesData();

  if (result.error || !result.data) {
    throw new Response('Error al cargar los clientes', { status: 500 });
  }

  return result.data;
}

export default function Clientes({ loaderData }: Route.ComponentProps) {
  const { clientes, giros, comunas } = loaderData;
  const pageBreadcrumbs = [{ label: 'Administracion' }, { label: 'Clientes' }];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <ClientesComponent clientes={clientes} giros={giros} comunas={comunas} />
    </div>
  );
}

export function hydrateFallback() {
  return <AdministracionHydrateFallback />;
}
