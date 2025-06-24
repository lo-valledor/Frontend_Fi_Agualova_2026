/* eslint-disable no-empty-pattern */
import React from 'react';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import CiclosFacturacionComponent from '~/components/mantencion/ciclos-facturacion/ciclos-facturacion-component';
import type { Route } from './+types/ciclos-facturacion';
import api from '~/lib/api';
import type { CiclosFacturacion } from '~/types/mantencion';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Ciclos de Facturación' },
    {
      name: 'description',
      content: 'Gestión de ciclos de facturación del sistema',
    },
  ];
}

export async function clientLoader() {
  try {
    const response = await api.get('/buscarCiclo');

    // Manejar diferentes formatos de respuesta de la API
    let ciclosFacturacion: CiclosFacturacion[] = [];

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data &&
      Array.isArray((response.data as { data: CiclosFacturacion[] }).data)
    ) {
      ciclosFacturacion = (response.data as { data: CiclosFacturacion[] }).data;
    } else if (Array.isArray(response.data)) {
      ciclosFacturacion = response.data;
    }

    return { ciclosFacturacion };
  } catch (_error) {
    throw new Response('Error al cargar los ciclos de facturación', {
      status: 500,
    });
  }
}

export default function CiclosFacturacion({
  loaderData,
}: Route.ComponentProps) {
  const { ciclosFacturacion } = loaderData;

  const pageBreadcrumbs = [
    { label: 'Mantención' },
    { label: 'Ciclos de Facturación' },
  ];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CiclosFacturacionComponent ciclosFacturacion={ciclosFacturacion} />
    </div>
  );
}
