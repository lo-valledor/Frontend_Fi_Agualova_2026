/* eslint-disable no-empty-pattern */
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import PrepararLecturasComponent from '~/components/operaciones/preparar-lecturas/preparar-lecturas-component';
import React, { useState, useCallback } from 'react';
import type { Route } from './+types/preparar-lecturas';
import api from '~/lib/api';
import type {
  PeriodoAbierto,
  ValidarSectoresPendientes,
  ConsultarSectores,
  OpcionesPrepararLecturas,
  ConsultarAsignacionSectores,
} from '~/types/operaciones';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Preparar Lecturas' },
    { name: 'description', content: 'Preparar Lecturas' },
  ];
}

export async function clientLoader() {
  try {
    const [periodoAbierto, lecturasPendientes, sectores, opcionesPreparar] =
      await Promise.all([
        api.get('/ConsultarPeriodoAbierto'),
        api.get('/validar-lecturas-pendientes'),
        api.get('/consultar-sectores'),
        api.get('/opciones-preparar-lecturas', { params: { control: '1' } }),
      ]);

    return {
      periodoAbierto: periodoAbierto.data as PeriodoAbierto[],
      lecturasPendientes: lecturasPendientes.data as ValidarSectoresPendientes,
      sectores: sectores.data as ConsultarSectores[],
      opcionesPreparar: opcionesPreparar.data as OpcionesPrepararLecturas[],
    };
  } catch (_error) {
    return {
      periodoAbierto: null,
      lecturasPendientes: null,
      sectores: null,
      opcionesPreparar: null,
    };
  }
}

export default function PrepararLecturas({ loaderData }: Route.ComponentProps) {
  const { periodoAbierto, lecturasPendientes, sectores, opcionesPreparar } =
    loaderData;

  // Estado local para los datos de asignación de sectores (permitirá actualizaciones reactivas)
  const [asignacionSectores, setAsignacionSectores] = useState<
    ConsultarAsignacionSectores[]
  >([]);
  const [isLoadingAsignacion, setIsLoadingAsignacion] = useState(false);

  const pageBreadcrumbs = [
    { label: 'Operaciones' },
    { label: 'Preparar Lecturas' },
  ];

  // Función para recargar los datos de asignación de sectores
  const recargarAsignacionSectores = useCallback(
    async (cicloFacturable: string, periodo: string) => {
      if (!cicloFacturable || !periodo) {
        return;
      }

      setIsLoadingAsignacion(true);
      try {
        const params = new URLSearchParams();
        params.append('cicloFacturable', cicloFacturable);
        params.append('periodo', periodo);

        const response = await api.get('/consultar-asignacion-sectores', {
          params,
        });

        if (response.data && Array.isArray(response.data)) {
          setAsignacionSectores(response.data as ConsultarAsignacionSectores[]);
        } else {
          setAsignacionSectores([]);
        }
      } catch (error) {
        console.error('Error al recargar asignación de sectores:', error);
        setAsignacionSectores([]);
      } finally {
        setIsLoadingAsignacion(false);
      }
    },
    [],
  );

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <PrepararLecturasComponent
        periodoAbierto={periodoAbierto ?? []}
        lecturasPendientes={lecturasPendientes}
        sectores={sectores ?? []}
        opcionesPreparar={opcionesPreparar ?? []}
        asignacionSectores={asignacionSectores}
        setAsignacionSectores={setAsignacionSectores}
        isLoadingAsignacion={isLoadingAsignacion}
        onRecargarAsignacionSectores={recargarAsignacionSectores}
      />
    </div>
  );
}
