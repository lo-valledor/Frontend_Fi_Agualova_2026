/* eslint-disable no-empty-pattern */
import ExportarLecturasComponent from '~/components/monitor/exportar-lecturas-component';
import { MonitorHydrateFallback } from '~/components/monitor/monitor-hydrate-fallback';
import { mantencionService } from '~/services/mantencionService';
import { monitorService } from '~/services/monitorService';
import { reportesService } from '~/services/reportesService';
import type { Route } from './+types/exportar-lecturas';

export function hydrateFallback() {
  return <MonitorHydrateFallback />;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Agualova | Exportar Lecturas' },
    { name: 'description', content: 'Exportar lecturas de medidores' }
  ];
}

export async function clientLoader({}: Route.ClientLoaderArgs) {
  const resPeriodoActivo = await monitorService.getPeriodos();
  const resPeriodos = await reportesService.getListadoPeriodos();
  const resSectores = await mantencionService.getSectores();
  const resNichos = await mantencionService.getNichos();

  if (
    resPeriodos.error ||
    !resPeriodos.data ||
    resSectores.error ||
    !resSectores.data ||
    resNichos.error ||
    !resNichos.data
  ) {
    return {
      periodos: resPeriodos.data || [],
      sectores: resSectores.data || [],
      nichos: resNichos.data || [],
      periodoActivo: resPeriodoActivo.data || [],
      error:
        resPeriodos.error ||
        resSectores.error ||
        resNichos.error ||
        'Error al obtener los datos del monitor'
    };
  }

  return {
    periodos: resPeriodos.data || [],
    sectores: resSectores.data || [],
    nichos: resNichos.data || [],
    periodoActivo: resPeriodoActivo.data || [],
    error: null
  };
}

export default function ExportarLecturas({ loaderData }: Route.ComponentProps) {
  return <ExportarLecturasComponent {...loaderData} />;
}
