/* eslint-disable no-empty-pattern */
import React from 'react';

import ExportarLecturasComponent from '~/components/monitor/exportar-lecturas-component';
import { monitorService } from '~/services/monitorService';

import type { Route } from './+types/exportar-lecturas';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Exportar Lecturas' },
    { name: 'description', content: 'Exportar lecturas de medidores' },
  ];
}

export async function clientLoader({}: Route.ClientLoaderArgs) {
  const result = await monitorService.getPeriodosAndSectores();

  if (result.error || !result.data) {
    return {
      periodos: [],
      sectores: [],
      activePeriodoId: null,
      error: new Error(result.error || 'Error al cargar datos'),
    };
  }

  return {
    periodos: result.data.periodos,
    sectores: result.data.sectores,
    activePeriodoId: result.data.activePeriodoId,
    error: null,
  };
}

export default function ExportarLecturas({ loaderData }: Route.ComponentProps) {
  return <ExportarLecturasComponent {...loaderData} />;
}
