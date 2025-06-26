/* eslint-disable no-empty-pattern */
import React from 'react';
import type { Route } from './+types/exportar-lecturas';
import ExportarLecturasComponent from '~/components/monitor/exportar-lecturas-component';
import api from '~/lib/api';
import type { Periodo, Sector } from '~/types/monitor';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Exportar Lecturas' },
    { name: 'description', content: 'Exportar lecturas de medidores' },
  ];
}

export async function clientLoader({}: Route.ClientLoaderArgs) {
  try {
    // Verificar si hay token antes de hacer peticiones
    const token = localStorage.getItem('token');
    if (!token) {
      //console.log('No token found in clientLoader, skipping API calls');
      throw new Error('No authentication token found');
    }

    // Carga paralela de datos iniciales necesarios
    const [periodosRes, sectoresRes] = await Promise.all([
      api.get<Periodo[]>('/Periodos'),
      api.get<Sector[]>('/Sectores'),
    ]);

    const periodosData = Array.isArray(periodosRes.data)
      ? periodosRes.data
      : [];
    const sectoresData = Array.isArray(sectoresRes.data)
      ? sectoresRes.data
      : [];

    // Encontrar el período activo
    let activePeriodoId: number | null = null;
    if (periodosData && periodosData.length > 0) {
      const activePeriodo = periodosData.find(
        (periodo: Periodo) => periodo.EstadoPeriodo === 2,
      );
      if (activePeriodo) {
        activePeriodoId = Number(activePeriodo.IdPeriodo);
      }
    }

    return {
      periodos: periodosData,
      sectores: sectoresData,
      activePeriodoId,
      error: null,
    };
  } catch (error) {
    // Retornar datos vacíos con error para que el componente pueda manejar el error
    return {
      periodos: [],
      sectores: [],
      activePeriodoId: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export default function ExportarLecturas({ loaderData }: Route.ComponentProps) {
  return <ExportarLecturasComponent {...loaderData} />;
}
