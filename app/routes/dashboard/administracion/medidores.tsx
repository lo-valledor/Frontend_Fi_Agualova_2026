// eslint-disable no-empty-pattern
import React from 'react';
import MedidoresComponent from '~/components/administracion/medidores/medidores-component';
import type { Route } from './+types/medidores';
import api from '~/lib/api';
import { useLoaderData } from 'react-router';
import type { BuscarMedidores } from '~/types/administracion';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Medidores' },
    { name: 'description', content: 'Medidores' },
  ];
}

export async function clientLoader() {
  const res = await api.get('buscarMedidor');
  return {
    medidores: res.data as BuscarMedidores[],
  };
}

export default function Medidores() {
  const { medidores } = useLoaderData<typeof clientLoader>();
  const pageBreadcrumbs = [{ label: 'Administracion' }, { label: 'Medidores' }];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <MedidoresComponent medidores={medidores} />
    </div>
  );
}
