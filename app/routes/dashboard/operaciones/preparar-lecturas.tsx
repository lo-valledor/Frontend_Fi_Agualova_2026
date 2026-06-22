/* eslint-disable no-empty-pattern */
import { useCallback, useState } from 'react';

import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import PrepararLecturasComponent from '~/components/operaciones/preparar-lecturas/preparar-lecturas-component';
import { operacionesService } from '~/services/operacionesService';
import type {
  PrepararLecturasBuscarNichosRequest,
  PrepararLecturasFiltrosCiclosResponse,
  PrepararLecturasFiltrosPeriodosResponse
} from '~/types/operaciones';

import type { Route } from './+types/preparar-lecturas';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Agualova | Preparar Lecturas' },
    { name: 'description', content: 'Preparar Lecturas' }
  ];
}

interface PrepararLecturasLoaderData {
  periodoAbierto: PrepararLecturasFiltrosPeriodosResponse[];
  ciclos: PrepararLecturasFiltrosCiclosResponse[];
  error: string | null;
}

export async function clientLoader() {
  const result = await operacionesService.getPrepararLecturasData();

  if (result.error || !result.data) {
    return {
      periodoAbierto: [],
      ciclos: [],
      error: 'Error al cargar los datos de preparación'
    } satisfies PrepararLecturasLoaderData;
  }

  return {
    periodoAbierto: result.data.periodoAbierto,
    ciclos: result.data.ciclos,
    error: null
  } satisfies PrepararLecturasLoaderData;
}

export default function PrepararLecturas({ loaderData }: Route.ComponentProps) {
  const { periodoAbierto, ciclos, error } = loaderData;

  const [nichos, setNichos] = useState<PrepararLecturasBuscarNichosRequest[]>([]);
  const [isLoadingNichos, setIsLoadingNichos] = useState(false);

  const pageBreadcrumbs = [
    { label: 'Operaciones' },
    { label: 'Preparar Lecturas' }
  ];

  const recargarNichos = useCallback(
    async (cicloId: number, periodoId: string) => {
      if (!cicloId || !periodoId) return;

      setIsLoadingNichos(true);
      try {
        const result = await operacionesService.getBuscarNichos(
          cicloId,
          periodoId
        );

        if (result.error || !result.data) {
          setNichos([]);
        } else {
          const data = Array.isArray(result.data)
            ? (result.data as PrepararLecturasBuscarNichosRequest[])
            : [];
          setNichos(data);
        }
      } catch (err) {
        console.error('Error al obtener nichos:', err);
        setNichos([]);
      } finally {
        setIsLoadingNichos(false);
      }
    },
    []
  );

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <PrepararLecturasComponent
        periodoAbierto={periodoAbierto}
        ciclos={ciclos}
        nichos={nichos}
        setNichos={setNichos}
        isLoadingNichos={isLoadingNichos}
        onRecargarNichos={recargarNichos}
        error={error}
      />
    </div>
  );
}