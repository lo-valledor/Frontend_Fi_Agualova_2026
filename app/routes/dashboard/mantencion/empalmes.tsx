/* eslint-disable no-empty-pattern */
import React from 'react';
import type { Route } from './+types/empalmes';
import EmpalmesComponent from '~/components/mantencion/empalmes/empalmes-component';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import api from '~/lib/api';
import type { Empalme } from '~/types/mantencion';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Empalmes' },
    { name: 'description', content: 'Gestión de empalmes del sistema' },
  ];
}

export async function clientLoader() {
  try {
    const response = await api.get('/buscarEmpalmes');

    // Manejar diferentes formatos de respuesta de la API
    let empalmes: Empalme[] = [];

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data &&
      Array.isArray((response.data as { data: Empalme[] }).data)
    ) {
      empalmes = (response.data as { data: Empalme[] }).data;
    } else if (Array.isArray(response.data)) {
      empalmes = response.data;
    }

    return { empalmes };
  } catch (_error) {
    throw new Response('Error al cargar los empalmes', { status: 500 });
  }
}

export default function Empalmes({ loaderData }: Route.ComponentProps) {
  const { empalmes } = loaderData;

  const pageBreadcrumbs = [{ label: 'Mantención' }, { label: 'Empalmes' }];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <EmpalmesComponent empalmes={empalmes} />
    </div>
  );
}
