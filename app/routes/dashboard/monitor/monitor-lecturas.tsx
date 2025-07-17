/* eslint-disable no-empty-pattern */
import React from 'react';
import type { Route } from './+types/monitor-lecturas';
import MonitorLecturasComponent from '~/components/monitor/monitor-lecturas-component';
import { monitorService } from '~/services/monitorService';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Monitor Lecturas' },
    { name: 'description', content: 'Monitoreo de lecturas de medidores' },
  ];
}

export async function clientLoader() {
  const result = await monitorService.getBasicData();

  if (result.error || !result.data) {
    return {
      periodos: [],
      sectores: [],
      claves: [],
      activePeriodoId: null,
      error: new Error(result.error || 'Error al cargar datos'),
    };
  }

  return {
    periodos: result.data.periodos,
    sectores: result.data.sectores,
    claves: result.data.claves,
    activePeriodoId: result.data.activePeriodoId,
    error: null,
  };
}

export default function MonitorLecturasPage({
  loaderData,
}: Route.ComponentProps) {
  return (
    <div>
      <MonitorLecturasComponent {...loaderData} />
    </div>
  );
}
