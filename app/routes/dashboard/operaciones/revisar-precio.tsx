/* eslint-disable no-empty-pattern */
import React, { useCallback, useState } from 'react';

import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import RevisarPrecioComponent from '~/components/operaciones/revisar-precio/revisar-precio-component';
import { operacionesService } from '~/services/operacionesService';
import type { RevisarPrecioDos, RevisarPrecioUno } from '~/types/operaciones';

import type { Route } from './+types/revisar-precio';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Agualova | Revisar Precio' },
    { name: 'description', content: 'Revisar Precio' }
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  const dia = url.searchParams.get('dia') || '15'; // Por defecto ciclo 15

  const result = await operacionesService.getRevisarPrecioData(dia);

  if (result.error || !result.data) {
    return {
      dataPeriodoAbierto: [],
      dataConsultarPreciosUno: [],
      dataConsultarPreciosDos: [],
      ciclosFacturacion: [],
      dia: '15',
      error: result.error || 'Error al cargar los datos'
    };
  }

  return {
    dataPeriodoAbierto: result.data.dataPeriodoAbierto,
    dataConsultarPreciosUno: result.data.dataConsultarPreciosUno,
    dataConsultarPreciosDos: result.data.dataConsultarPreciosDos,
    ciclosFacturacion: result.data.ciclosFacturacion,
    dia,
    error: null
  };
}

export default function RevisarPrecio({ loaderData }: Route.ComponentProps) {
  const {
    dataPeriodoAbierto,
    dataConsultarPreciosUno: initialPreciosUno,
    dataConsultarPreciosDos: initialPreciosDos,
    ciclosFacturacion,
    dia,
    error
  } = loaderData;

  // Estado local para los datos de precios (permitirá actualizaciones reactivas)
  const [dataConsultarPreciosUno, setDataConsultarPreciosUno] =
    useState<RevisarPrecioUno[]>(initialPreciosUno);
  const [dataConsultarPreciosDos, setDataConsultarPreciosDos] =
    useState<RevisarPrecioDos[]>(initialPreciosDos);
  const [isLoadingPrecios, setIsLoadingPrecios] = useState(false);
  const [cicloSeleccionado, setCicloSeleccionado] = useState(dia);

  const pageBreadcrumbs = [
    { label: 'Operaciones' },
    { label: 'Revisar Precio' }
  ];

  // Función para recargar solo los datos de precios
  const recargarPrecios = useCallback(
    async (nuevoCiclo?: string) => {
      if (!dataPeriodoAbierto || dataPeriodoAbierto.length === 0) {
        return;
      }

      setIsLoadingPrecios(true);
      try {
        const mes = dataPeriodoAbierto[0].mes;
        const anio = dataPeriodoAbierto[0].anio;
        const ciclo = nuevoCiclo || cicloSeleccionado;

        const result = await operacionesService.getPreciosPorCiclo(
          mes,
          anio,
          ciclo
        );

        if (result.error || !result.data) {
          setDataConsultarPreciosUno([]);
          setDataConsultarPreciosDos([]);
        } else {
          setDataConsultarPreciosUno(result.data.preciosUno);
          setDataConsultarPreciosDos(result.data.preciosDos);
        }
      } finally {
        setIsLoadingPrecios(false);
      }
    },
    [dataPeriodoAbierto, cicloSeleccionado]
  );

  const handleCicloChange = async (nuevoCiclo: string) => {
    setCicloSeleccionado(nuevoCiclo);
    // Recargar precios con el nuevo ciclo
    await recargarPrecios(nuevoCiclo);
  };

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <RevisarPrecioComponent
        dataPeriodoAbierto={dataPeriodoAbierto}
        dataConsultarPreciosUno={dataConsultarPreciosUno}
        dataConsultarPreciosDos={dataConsultarPreciosDos}
        ciclosFacturacion={ciclosFacturacion}
        cicloSeleccionado={cicloSeleccionado}
        onCicloChange={handleCicloChange}
        isLoading={false}
        error={error}
        onRecargarPrecios={recargarPrecios}
        isLoadingPrecios={isLoadingPrecios}
      />
    </div>
  );
}
