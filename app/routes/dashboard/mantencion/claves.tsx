/* eslint-disable no-empty-pattern */
import React from 'react';
import type { Route } from './+types/claves';
import api from '~/lib/api';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import ClavesComponent from '~/components/mantencion/claves/claves-component';
import type { Claves } from '~/types/mantencion';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Claves' },
    { name: 'description', content: 'Gestión de claves del sistema' },
  ];
}

export async function clientLoader() {
  try {
    const response = await api.get('/buscarClaves');

    // Manejar diferentes formatos de respuesta de la API
    let claves: Claves[] = [];

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data &&
      Array.isArray((response.data as { data: Claves[] }).data)
    ) {
      claves = (response.data as { data: Claves[] }).data;
    } else if (Array.isArray(response.data)) {
      claves = response.data;
    }

    return { claves };
  } catch (_error) {
    throw new Response('Error al cargar las claves', { status: 500 });
  }
}

export default function Claves({ loaderData }: Route.ComponentProps) {
  const { claves } = loaderData;

  const pageBreadcrumbs = [{ label: 'Mantención' }, { label: 'Claves' }];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <ClavesComponent claves={claves} />
    </div>
  );
}
