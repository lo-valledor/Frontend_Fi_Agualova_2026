/* eslint-disable no-empty-pattern */
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import AbrirPeriodoFacturacion from '~/components/operaciones/periodo-facturacion/periodo-facturacion-component';
import React from 'react';
import type { Route } from './+types/periodo-facturacion';
import api from '~/lib/api';
import type { Anio } from '~/types/operaciones';
import type { Periodos } from '~/types/operaciones';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Periodos de Facturación' },
    { name: 'description', content: 'Periodos de Facturación' },
  ];
}

export async function clientLoader() {
  const resYears = await api.get('/consulta-año');
  const resPeriodos = await api.get('/consulta-periodo');
  const years = resYears.data as Anio[];
  const periodos = resPeriodos.data as Periodos[];
  return { years, periodos };
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
