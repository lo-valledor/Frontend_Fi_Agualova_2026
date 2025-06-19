import React from 'react';
import type { Route } from './+types/tarifas';
import type { Tarifas } from '~/types/mantencion';
import api from '~/lib/api';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import TarifasComponent from '~/components/mantencion/tarifas/tarifas-component';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Tarifas' },
    { name: 'description', content: 'Gestión de Tarifas del sistema' },
  ];
}

export async function clientLoader() {
  try {
    const response = await api.get('/buscarTarifa');

    // Manejar diferentes formatos de respuesta de la API
    let tarifas: Tarifas[] = [];

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data &&
      Array.isArray((response.data as any).data)
    ) {
      tarifas = (response.data as { data: Tarifas[] }).data;
    } else if (Array.isArray(response.data)) {
      tarifas = response.data;
    }

    return { tarifas };
  } catch (error) {
    console.error('Error al cargar tarifas:', error);
    throw new Response('Error al cargar las tarifas', { status: 500 });
  }
}

export default function Tarifas({ loaderData }: Route.ComponentProps) {
  const { tarifas } = loaderData;

  const pageBreadcrumbs = [{ label: 'Mantención' }, { label: 'Tarifas' }];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <TarifasComponent tarifas={tarifas} />
    </div>
  );
}
