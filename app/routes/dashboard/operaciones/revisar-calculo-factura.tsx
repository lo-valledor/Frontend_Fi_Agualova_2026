/* eslint-disable no-empty-pattern */
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import RevisarCalculoFacturaComponent from '~/components/operaciones/revisar-calculo-factura/revisar-calculo-factura-component';
import React from 'react';
import type { Route } from './+types/revisar-calculo-factura';
import type { PeriodoAbierto } from '~/types/operaciones';
import api from '~/lib/api';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Revisar Calculo de Factura' },
    { name: 'description', content: 'Revisar Calculo de Factura' },
  ];
}

export async function clientLoader() {
  const periodoAbierto = await api.get('/ConsultarPeriodoAbierto');
  return { periodoAbierto: periodoAbierto.data as PeriodoAbierto[] };
}

export default function RevisarCalculoFactura({
  loaderData,
}: Route.ComponentProps) {
  const { periodoAbierto } = loaderData;
  const pageBreadcrumbs = [
    { label: 'Operaciones' },
    { label: 'Revisar Calculo de Factura' },
  ];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <RevisarCalculoFacturaComponent periodoAbierto={periodoAbierto ?? []} />
    </div>
  );
}
