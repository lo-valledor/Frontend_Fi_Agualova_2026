// eslint-disable no-empty-pattern
import React from 'react';
import ClientesComponent from '~/components/administracion/clientes/clientes-component';
import type { Route } from './+types/clientes';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import api from '~/lib/api';
import type {
  GetClientes,
  GetGiros,
  GetRegiones,
} from '~/types/administracion';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Clientes' },
    { name: 'description', content: 'Clientes' },
  ];
}

export async function clientLoader({}: Route.ClientActionArgs) {
  const res = await api.get('ClienteBuscar');
  const resGiros = await api.get('giro/buscar');
  const resRegiones = await api.get('region/listar');
  return {
    clientes: res.data as GetClientes[],
    giros: resGiros.data as GetGiros[],
    regiones: resRegiones.data as GetRegiones[],
  };
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
