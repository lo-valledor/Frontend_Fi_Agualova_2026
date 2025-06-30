/* eslint-disable no-empty-pattern */
import React from 'react';
import type { Route } from './+types/monitor-lecturas';
import MonitorLecturasComponent from '~/components/monitor/monitor-lecturas-component';
import api from '~/lib/api';
import type { Periodo, Sector, Clave } from '~/types/monitor';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Monitor Lecturas' },
    { name: 'description', content: 'Monitoreo de lecturas de medidores' },
  ];
}

export async function clientLoader() {
  try {
    // Verificar si hay token antes de hacer peticiones
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found in clientLoader, skipping API calls');
      throw new Error('No authentication token found');
    }

    // Cargar datos básicos del monitor directamente en el loader
    const [periodosRes, clavesRes, sectoresRes] = await Promise.all([
      api.get<Periodo[]>('/Periodos'),
      api.get<Clave[]>('/Claves'),
      api.get<Sector[]>('/Sectores'),
    ]);

    const periodosData = Array.isArray(periodosRes.data)
      ? periodosRes.data
      : [];
    const clavesData = Array.isArray(clavesRes.data) ? clavesRes.data : [];
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
      claves: clavesData,
      sectores: sectoresData,
      activePeriodoId,
      error: null,
    };
  } catch (error) {
    // Retornar datos vacíos con error para que el componente pueda manejar el error
    return {
      periodos: [],
      sectores: [],
      claves: [],
      activePeriodoId: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
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
