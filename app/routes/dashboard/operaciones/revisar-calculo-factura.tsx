/* eslint-disable no-empty-pattern */
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import RevisarCalculoFacturaComponent from '~/components/operaciones/revisar-calculo-factura/revisar-calculo-factura-component';
import React from 'react';
import type { Route } from './+types/revisar-calculo-factura';
import { operacionesService } from '~/services/operacionesService';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Revisar Calculo de Factura' },
    { name: 'description', content: 'Revisar Calculo de Factura' },
  ];
}

export async function clientLoader() {
  const [periodoResult, ciclosResult] = await Promise.all([
    operacionesService.getPeriodoAbierto(),
    operacionesService.getCiclosFacturacion(),
  ]);

  return {
    periodoAbierto: periodoResult.error || !periodoResult.data ? [] : periodoResult.data,
    ciclosFacturacionActivos: ciclosResult.error || !ciclosResult.data ? [] : ciclosResult.data,
  };
}

export default function RevisarCalculoFactura({
  loaderData,
}: Route.ComponentProps) {
  const { periodoAbierto, ciclosFacturacionActivos } = loaderData;
  const pageBreadcrumbs = [
    { label: 'Operaciones' },
    { label: 'Revisar Calculo de Factura' },
  ];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <RevisarCalculoFacturaComponent
        periodoAbierto={periodoAbierto ?? []}
        ciclosFacturacionActivos={ciclosFacturacionActivos ?? []}
      />
    </div>
  );
}
