// eslint-disable no-empty-pattern
import React from 'react';
import type { Route } from './+types/clientes';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import api from '~/lib/api';
import type {
  GetClientes,
  GetGiros,
  GetRegiones,
} from '~/types/administracion';
import ClientesComponent from '~/components/administracion/clientes/clientes-component';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Clientes' },
    { name: 'description', content: 'Clientes' },
  ];
}

export async function clientLoader({}: Route.ClientActionArgs) {
  try {
    const resClientes = await api.get('ClienteBuscar');
    const resGiros = await api.get('giro/buscar');
    const resRegiones = await api.get('region/listar');

    // Manejar diferentes formatos de respuesta de la API
    let clientes: GetClientes[] = [];
    let giros: GetGiros[] = [];
    let regiones: GetRegiones[] = [];

    if (
      resClientes.data &&
      typeof resClientes.data === 'object' &&
      'data' in resClientes.data &&
      Array.isArray((resClientes.data as any).data)
    ) {
      clientes = (resClientes.data as { data: GetClientes[] }).data;
    } else if (Array.isArray(resClientes.data)) {
      clientes = resClientes.data;
    }

    if (
      resGiros.data &&
      typeof resGiros.data === 'object' &&
      'data' in resGiros.data &&
      Array.isArray((resGiros.data as any).data)
    ) {
      giros = (resGiros.data as { data: GetGiros[] }).data;
    } else if (Array.isArray(resGiros.data)) {
      giros = resGiros.data;
    }

    if (
      resRegiones.data &&
      typeof resRegiones.data === 'object' &&
      'data' in resRegiones.data &&
      Array.isArray((resRegiones.data as any).data)
    ) {
      regiones = (resRegiones.data as { data: GetRegiones[] }).data;
    } else if (Array.isArray(resRegiones.data)) {
      regiones = resRegiones.data;
    }

    return { clientes, giros, regiones };
  } catch (error) {
    console.error('Error al cargar clientes:', error);
    throw new Response('Error al cargar los clientes', { status: 500 });
  }
}

export default function Clientes({ loaderData }: Route.ComponentProps) {
  const { clientes, giros, regiones } = loaderData;
  const pageBreadcrumbs = [{ label: 'Administracion' }, { label: 'Clientes' }];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <ClientesComponent
        clientes={clientes}
        giros={giros}
        regiones={regiones}
      />
    </div>
  );
}
