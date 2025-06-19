import React from 'react';
import type { Route } from './+types/zonas';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import api from '~/lib/api';
import type { Zonas } from '~/types/mantencion';
import ZonasComponent from '~/components/mantencion/zonas/zonas-component';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Zonas' },
    { name: 'description', content: 'Gestión de zonas del sistema' },
  ];
}

export async function clientLoader() {
  try {
    const response = await api.get('/buscarZona');

    // Manejar diferentes formatos de respuesta de la API
    let zonas: Zonas[] = [];

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data &&
      Array.isArray((response.data as any).data)
    ) {
      zonas = (response.data as { data: Zonas[] }).data;
    } else if (Array.isArray(response.data)) {
      zonas = response.data;
    }

    return { zonas };
  } catch (error) {
    console.error('Error al cargar zonas:', error);
    throw new Response('Error al cargar las zonas', { status: 500 });
  }
}

export default function Zonas({ loaderData }: Route.ComponentProps) {
  const { zonas } = loaderData;

  const pageBreadcrumbs = [{ label: 'Mantención' }, { label: 'Zonas' }];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <ZonasComponent zonas={zonas} />
    </div>
  );
}
