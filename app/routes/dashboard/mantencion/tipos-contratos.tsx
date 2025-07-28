/* eslint-disable no-empty-pattern */
import React from 'react';

import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import TiposContratosComponent from '~/components/mantencion/tipos-contratos/tipos-contratos-component';
import { mantencionService } from '~/services/mantencionService';

import type { Route } from './+types/tipos-contratos';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Tipos de Contratos' },
    { name: 'description', content: ' Tipos de Contratos' },
  ];
}

export async function clientLoader() {
  const result = await mantencionService.getTiposContratos();

  if (result.error || !result.data) {
    return { tiposContratos: [] };
  }

  return { tiposContratos: result.data };
}

export default function TiposContratos({ loaderData }: Route.ComponentProps) {
  const { tiposContratos } = loaderData;

  const pageBreadcrumbs = [
    { label: 'Mantención' },
    { label: 'Tipos de Contratos' },
  ];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <TiposContratosComponent tiposContratos={tiposContratos} />
    </div>
  );
}
