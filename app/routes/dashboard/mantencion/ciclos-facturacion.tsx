/* eslint-disable no-empty-pattern */
import React from 'react';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import CiclosFacturacionComponent from '~/components/mantencion/ciclos-facturacion/ciclos-facturacion-component';
import type { Route } from './+types/ciclos-facturacion';
import { mantencionService } from '~/services/mantencionService';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Ciclos de Facturación' },
    {
      name: 'description',
      content: 'Gestión de ciclos de facturación del sistema',
    },
  ];
}

export async function clientLoader() {
  const result = await mantencionService.getCiclosFacturacion();

  if (result.error || !result.data) {
    return { ciclosFacturacion: [] };
  }

  return { ciclosFacturacion: result.data };
}

export default function CiclosFacturacion({
  loaderData,
}: Route.ComponentProps) {
  const { ciclosFacturacion } = loaderData;

  const pageBreadcrumbs = [
    { label: 'Mantención' },
    { label: 'Ciclos de Facturación' },
  ];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CiclosFacturacionComponent ciclosFacturacion={ciclosFacturacion} />
    </div>
  );
}
