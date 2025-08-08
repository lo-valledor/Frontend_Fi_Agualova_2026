/* eslint-disable no-empty-pattern */
import React from 'react';

import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import ContratoComponent from '~/components/reportes/consultar-contrato/contrato/contrato-component';
import { reportesService } from '~/services/reportesService';

import type { Route } from './+types/contrato';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Consulta Contrato' },
    { name: 'description', content: 'Consulta de Contrato' },
  ];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const result = await reportesService.getDetallesPorContrato(
    Number((params as { contratoId: string }).contratoId)
  );

  if (result.error || !result.data) {
    return {
      detallesContrato: {
        detallePropietario: [],
        detalleCliente: [],
        detalleLocal: [],
        detalleContrato: [],
        detalleMedidores: [],
        detalleUbicacion: [],
        detalleLecturas: [],
        detalleFacturas: [],
      },
    };
  }

  return {
    detallesContrato: result.data,
  };
}

export default function ContratoDetalle({ loaderData }: Route.ComponentProps) {
  const pageBreadcrumbs = [{ label: 'Reportes' }, { label: 'Contrato' }];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <ContratoComponent {...loaderData} />
    </div>
  );
}
