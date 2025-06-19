import React from 'react';
import type { Route } from './+types/parametros';
import type { Parametro } from '~/types/mantencion';
import api from '~/lib/api';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import ParametrosComponent from '~/components/mantencion/parametros/parametros-component';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Parámetros' },
    { name: 'description', content: 'Gestión de Parámetros del sistema' },
  ];
}

export async function clientLoader() {
  try {
    const response = await api.get('/buscarParametro');

    // Manejar diferentes formatos de respuesta de la API
    let parametros: Parametro[] = [];

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data &&
      Array.isArray((response.data as any).data)
    ) {
      parametros = (response.data as { data: Parametro[] }).data;
    } else if (Array.isArray(response.data)) {
      parametros = response.data;
    }

    return { parametros };
  } catch (error) {
    console.error('Error al cargar parámetros:', error);
    throw new Response('Error al cargar los parámetros', { status: 500 });
  }
}

export default function Parametros({ loaderData }: Route.ComponentProps) {
  const { parametros } = loaderData;

  const pageBreadcrumbs = [{ label: 'Mantención' }, { label: 'Parámetros' }];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <ParametrosComponent parametros={parametros} />
    </div>
  );
}
