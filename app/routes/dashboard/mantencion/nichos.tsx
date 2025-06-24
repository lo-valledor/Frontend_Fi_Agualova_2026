/* eslint-disable no-empty-pattern */
import React from 'react';
import type { Route } from './+types/nichos';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import api from '~/lib/api';
import type { Nicho } from '~/types/mantencion';
import NichosComponent from '~/components/mantencion/nichos/nichos-component';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Nichos' },
    { name: 'description', content: 'Gestión de nichos del sistema' },
  ];
}

export async function clientLoader() {
  try {
    const response = await api.get('/buscarNichoM');

    // Manejar diferentes formatos de respuesta de la API
    let nichos: Nicho[] = [];

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data &&
      Array.isArray((response.data as { data: Nicho[] }).data)
    ) {
      nichos = (response.data as { data: Nicho[] }).data;
    } else if (Array.isArray(response.data)) {
      nichos = response.data;
    }

    return { nichos };
  } catch (_error) {
    throw new Response('Error al cargar los nichos', { status: 500 });
  }
}

export default function Nichos({ loaderData }: Route.ComponentProps) {
  const { nichos } = loaderData;

  const pageBreadcrumbs = [{ label: 'Mantención' }, { label: 'Nichos' }];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <NichosComponent nichos={nichos} />
    </div>
  );
}
