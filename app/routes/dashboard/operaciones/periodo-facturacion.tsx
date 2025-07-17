/* eslint-disable no-empty-pattern */
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import AbrirPeriodoFacturacion from '~/components/operaciones/periodo-facturacion/periodo-facturacion-component';
import React from 'react';
import type { Route } from './+types/periodo-facturacion';
import { operacionesService } from '~/services/operacionesService';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Periodos de Facturación' },
    { name: 'description', content: 'Periodos de Facturación' },
  ];
}

export async function clientLoader() {
  const result = await operacionesService.getPeriodoFacturacionData();

  if (result.error || !result.data) {
    return {
      years: [],
      periodos: [],
    };
  }

  return result.data;
}

export default function PeriodoFacturacion({
  loaderData,
}: Route.ComponentProps) {
  const { years, periodos } = loaderData;
  const pageBreadcrumbs = [
    { label: 'Operaciones' },
    { label: 'Periodos de Facturación' },
  ];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <AbrirPeriodoFacturacion years={years} periodos={periodos} error={null} />
    </div>
  );
}
