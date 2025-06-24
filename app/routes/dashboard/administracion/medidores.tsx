/* eslint-disable no-empty-pattern */
import React from 'react';
import MedidoresComponent from '~/components/administracion/medidores/medidores-component';
import type { Route } from './+types/medidores';
import api from '~/lib/api';
import { useLoaderData } from 'react-router';
import type { GetMedidores } from '~/types/administracion';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import type { Marca } from '~/types/mantencion';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Medidores' },
    { name: 'description', content: 'Medidores' },
  ];
}

export async function clientLoader() {
  const res = await api.get('buscarMedidor');
  const resMarcas = await api.get('buscarMarca');
  return {
    medidores: res.data as GetMedidores[],
    marcas: resMarcas.data as Marca[],
  };
}

export default function Medidores() {
  const { medidores, marcas } = useLoaderData<typeof clientLoader>();
  const pageBreadcrumbs = [{ label: 'Administracion' }, { label: 'Medidores' }];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <MedidoresComponent medidores={medidores} marcas={marcas} />
    </div>
  );
}
