// eslint-disable no-empty-pattern
import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import RevisarPrecioComponent from "~/components/operaciones/revisar-precio/revisar-precio-component";
import React, { useState } from "react";
import type { Route } from "./+types/revisar-precio";
import api from "~/lib/api";
import type {
  PeriodoAbierto,
  RevisarPrecioUno,
  RevisarPrecioDos,
} from "~/types/operaciones";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Enerlova | Revisar Precio" },
    { name: "description", content: "Revisar Precio" },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  try {
    const url = new URL(request.url);
    const dia = url.searchParams.get("dia") || "15"; // Por defecto ciclo 15

    // Carga paralela de datos
    const [periodoAbierto, ciclosFacturacion] = await Promise.all([
      api.get("/ConsultarPeriodoAbierto"),
      api.get("/ciclos-facturacion-activos"),
    ]);

    const dataPeriodoAbierto = periodoAbierto.data as PeriodoAbierto[];
    const dataCiclosFacturacion = ciclosFacturacion.data as Array<{
      diaFacturacion: string;
      descripcion: string;
    }>;

    if (!dataPeriodoAbierto || dataPeriodoAbierto.length === 0) {
      return {
        dataPeriodoAbierto: [],
        dataConsultarPreciosUno: [],
        dataConsultarPreciosDos: [],
        ciclosFacturacion: [],
        dia,
        error: "No hay periodo abierto",
      };
    }

    // Validar si el ciclo es válido para el mes actual
    const mes = dataPeriodoAbierto[0].mes;
    const anio = dataPeriodoAbierto[0].anio;

    // Cargar datos de precios
    const [resConsultarPreciosUno, resConsultarPreciosDos] = await Promise.all([
      api.get(`/ConsultarPreciosUno?mes=${mes}&año=${anio}`),
      api.get(`/ConsultarPreciosDos?mes=${mes}&año=${anio}&dia=${dia}`),
    ]);

    return {
      dataPeriodoAbierto,
      dataConsultarPreciosUno:
        resConsultarPreciosUno.data as RevisarPrecioUno[],
      dataConsultarPreciosDos:
        resConsultarPreciosDos.data as RevisarPrecioDos[],
      ciclosFacturacion: dataCiclosFacturacion,
      dia,
      error: null,
    };
  } catch (error) {
    console.error("Error en clientLoader:", error);
    return {
      dataPeriodoAbierto: [],
      dataConsultarPreciosUno: [],
      dataConsultarPreciosDos: [],
      ciclosFacturacion: [],
      dia: "15",
      error: "Error al cargar los datos",
    };
  }
}

export default function RevisarPrecio({ loaderData }: Route.ComponentProps) {
  const {
    dataPeriodoAbierto,
    dataConsultarPreciosUno,
    dataConsultarPreciosDos,
    ciclosFacturacion,
    dia,
    error,
  } = loaderData;

  const [isLoading, setIsLoading] = useState(false);
  const [cicloSeleccionado, setCicloSeleccionado] = useState(dia);

  const pageBreadcrumbs = [
    { label: "Operaciones" },
    { label: "Revisar Precio" },
  ];

  const handleCicloChange = async (nuevoCiclo: string) => {
    setCicloSeleccionado(nuevoCiclo);
    // La actualización de datos se manejará en el componente hijo
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
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
