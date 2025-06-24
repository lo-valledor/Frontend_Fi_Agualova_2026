/* eslint-disable no-empty-pattern */
import React from 'react';
import type { Route } from './+types/tipos-contratos';
import TiposContratosComponent from '~/components/mantencion/tipos-contratos/tipos-contratos-component';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import type { TiposContrato } from '~/types/mantencion';
import api from '~/lib/api';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Tipos de Contratos' },
    { name: 'description', content: 'Gestión de Tipos de Contratos' },
  ];
}

export async function clientLoader() {
  try {
    const response = await api.get('/buscarTipoContrato');

    // Manejar diferentes formatos de respuesta de la API
    let tiposContratos: TiposContrato[] = [];

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data &&
      Array.isArray((response.data as { data: TiposContrato[] }).data)
    ) {
      tiposContratos = (response.data as { data: TiposContrato[] }).data;
    } else if (Array.isArray(response.data)) {
      tiposContratos = response.data;
    }

    return { tiposContratos };
  } catch {
    throw new Response('Error al cargar los tipos de contratos', {
      status: 500,
    });
  }
}

export default function TiposContratos({ loaderData }: Route.ComponentProps) {
  const { tiposContratos } = loaderData;

  const pageBreadcrumbs = [
    { label: 'Mantención' },
    { label: 'Tipos de Contratos' },
  ];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <TiposContratosComponent tiposContratos={tiposContratos} />
    </div>
  );
}
