import React from 'react';
import type { Route } from './+types/marcas';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import api from '~/lib/api';
import type { Marca } from '~/types/mantencion';
import MarcasComponent from '~/components/mantencion/marcas/marcas-component';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Marcas' },
    { name: 'description', content: 'Gestión de marcas del sistema' },
  ];
}

export async function clientLoader() {
  try {
    const response = await api.get('/buscarMarca');

    // Manejar diferentes formatos de respuesta de la API
    let marcas: Marca[] = [];

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data &&
      Array.isArray((response.data as any).data)
    ) {
      marcas = (response.data as { data: Marca[] }).data;
    } else if (Array.isArray(response.data)) {
      marcas = response.data;
    }

    return { marcas };
  } catch (error) {
    console.error('Error al cargar marcas:', error);
    throw new Response('Error al cargar las marcas', { status: 500 });
  }
}

export default function Marcas({ loaderData }: Route.ComponentProps) {
  const { marcas } = loaderData;

  const pageBreadcrumbs = [{ label: 'Mantención' }, { label: 'Marcas' }];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <MarcasComponent marcas={marcas} />
    </div>
  );
}
