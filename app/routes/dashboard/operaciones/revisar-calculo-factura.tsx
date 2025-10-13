/* eslint-disable no-empty-pattern */
import React from 'react';

import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import RevisarCalculoFacturaComponent from '~/components/operaciones/revisar-calculo-factura/revisar-calculo-factura-component';
import { operacionesService } from '~/services/operacionesService';

import type { Route } from './+types/revisar-calculo-factura';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Revisar Calculo de Factura' },
    { name: 'description', content: 'Revisar Calculo de Factura' }
  ];
}

export async function clientLoader() {
  const [periodoResult, ciclosResult] = await Promise.all([
    operacionesService.getPeriodoAbierto(),
    operacionesService.getCiclosFacturacion()
  ]);

  const periodoAbierto =
    periodoResult.error || !periodoResult.data ? [] : periodoResult.data;

  // Verificar estado de cierre de lecturas si hay período abierto
  let estadoCierreLecturas = null;
  if (periodoAbierto.length > 0) {
    const { mes, anio } = periodoAbierto[0];
    const periodoFormateado = `${mes.toString().padStart(2, '0')}${anio.toString()}`;
    const cicloId = '1'; // Ciclo día 15 (único ciclo normado)

    const estadoCierreResult =
      await operacionesService.verificarEstadoCierreLecturas(
        cicloId,
        periodoFormateado
      );

    if (!estadoCierreResult.error && estadoCierreResult.data) {
      estadoCierreLecturas = estadoCierreResult.data;
    }
  }

  return {
    periodoAbierto,
    ciclosFacturacionActivos:
      ciclosResult.error || !ciclosResult.data ? [] : ciclosResult.data,
    estadoCierreLecturas
  };
}

export default function RevisarCalculoFactura({
  loaderData
}: Route.ComponentProps) {
  const { periodoAbierto, ciclosFacturacionActivos, estadoCierreLecturas } =
    loaderData;
  const pageBreadcrumbs = [
    { label: 'Operaciones' },
    { label: 'Revisar Calculo de Factura' }
  ];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <RevisarCalculoFacturaComponent
        periodoAbierto={periodoAbierto ?? []}
        ciclosFacturacionActivos={ciclosFacturacionActivos ?? []}
        estadoCierreLecturas={estadoCierreLecturas}
      />
    </div>
  );
}
