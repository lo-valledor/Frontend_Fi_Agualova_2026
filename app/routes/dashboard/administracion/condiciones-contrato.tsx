// eslint-disable no-empty-pattern
import React from 'react';
import CondicionesContratoComponent from '~/components/administracion/condiciones-contrato/condiciones-contrato-component';
import type { Route } from './+types/condiciones-contrato';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import api from '~/lib/api';
import type { GetCondicionesContrato } from '~/types/administracion';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Condiciones Contrato' },
    { name: 'description', content: 'Condiciones Contrato' },
  ];
}

export async function clientLoader({}: Route.ClientActionArgs) {
  const res = await api.get('condicion-contrato/condicionContrato-Buscar');
  return {
    condicionesContrato: res.data as GetCondicionesContrato[],
  };
}

export default function CondicionesContrato({
  loaderData,
}: Route.ComponentProps) {
  const { condicionesContrato } = loaderData;
  const pageBreadcrumbs = [
    { label: 'Administracion' },
    { label: 'Condiciones Contrato' },
  ];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CondicionesContratoComponent condicionesContrato={condicionesContrato} />
    </div>
  );
}
