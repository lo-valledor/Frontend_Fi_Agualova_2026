/* eslint-disable no-empty-pattern */
import React, { useCallback, useState } from 'react';

import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import PrepararLecturasComponent from '~/components/operaciones/preparar-lecturas/preparar-lecturas-component';
import { operacionesService } from '~/services/operacionesService';
import type { ConsultarAsignacionSectores } from '~/types/operaciones';

import type { Route } from './+types/preparar-lecturas';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Preparar Lecturas' },
    { name: 'description', content: 'Preparar Lecturas' },
  ];
}

export async function clientLoader() {
  const result = await operacionesService.getPrepararLecturasData();

  if (result.error || !result.data) {
    return {
      periodoAbierto: null,
      lecturasPendientes: null,
      sectores: null,
      opcionesPreparar: null,
    };
  }

  return result.data;
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
        const result = await operacionesService.getAsignacionSectores(
          cicloFacturable,
          periodo
        );

        if (result.error || !result.data) {
          setAsignacionSectores([]);
        } else {
          setAsignacionSectores(result.data);
        }
      } catch (error) {
        console.error('Error al recargar asignación de sectores:', error);
        setAsignacionSectores([]);
      } finally {
        setIsLoadingAsignacion(false);
      }
    },
    []
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
