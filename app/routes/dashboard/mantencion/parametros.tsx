/* eslint-disable no-empty-pattern */
import React from 'react';

import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import ParametrosComponent from '~/components/mantencion/parametros/parametros-component';
import { mantencionService } from '~/services/mantencionService';

import type { Route } from './+types/parametros';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Parámetros' },
    { name: 'description', content: ' Parámetros del sistema' },
  ];
}

export async function clientLoader() {
  const result = await mantencionService.getParametros();

  if (result.error || !result.data) {
    return { parametros: [] };
  }

  return { parametros: result.data };
}

export default function Parametros({ loaderData }: Route.ComponentProps) {
  const { parametros } = loaderData;

  const pageBreadcrumbs = [{ label: 'Mantención' }, { label: 'Parámetros' }];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <ParametrosComponent parametros={parametros} />
    </div>
  );
}
