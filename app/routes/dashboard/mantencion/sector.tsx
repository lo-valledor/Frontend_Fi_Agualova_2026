import React from 'react';
import type { Route } from './+types/sector';
import api from '~/lib/api';
import type { Sectores } from '~/types/mantencion';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import SectorComponent from '~/components/mantencion/sector/sector-component';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Sectores' },
    { name: 'description', content: 'Gestión de sectores del sistema' },
  ];
}

export async function clientLoader() {
  try {
    const response = await api.get('/buscarSector');

    // Manejar diferentes formatos de respuesta de la API
    let sectores: Sectores[] = [];

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data &&
      Array.isArray((response.data as any).data)
    ) {
      sectores = (response.data as { data: Sectores[] }).data;
    } else if (Array.isArray(response.data)) {
      sectores = response.data;
    }

    return { sectores };
  } catch (error) {
    console.error('Error al cargar sectores:', error);
    throw new Response('Error al cargar los sectores', { status: 500 });
  }
}

export default function Sector({ loaderData }: Route.ComponentProps) {
  const { sectores } = loaderData;

  const pageBreadcrumbs = [{ label: 'Mantención' }, { label: 'Sectores' }];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <SectorComponent sectores={sectores} />
    </div>
  );
}
