// eslint-disable no-empty-pattern
import React from 'react';
import CondicionesContratoComponent from '~/components/administracion/condiciones-contrato/condiciones-contrato-component';
import type { Route } from './+types/condiciones-contrato';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import api from '~/lib/api';
import type { GetCondicionesContrato } from '~/types/administracion';
import type { Conceptos } from '~/types/mantencion';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Condiciones Contrato' },
    { name: 'description', content: 'Condiciones Contrato' },
  ];
}

export async function clientLoader({}: Route.ClientActionArgs) {
  const resCondicionesContrato = await api.get(
    'condicion-contrato/condicionContrato-Buscar',
  );
  const resConceptos = await api.get('buscarConceptos');

  let condicionesContrato: GetCondicionesContrato[] = [];
  let conceptos: Conceptos[] = [];

  if (
    resCondicionesContrato.data &&
    typeof resCondicionesContrato.data === 'object' &&
    'data' in resCondicionesContrato.data &&
    Array.isArray((resCondicionesContrato.data as any).data)
  ) {
    condicionesContrato = (
      resCondicionesContrato.data as { data: GetCondicionesContrato[] }
    ).data;
  } else if (Array.isArray(resCondicionesContrato.data)) {
    condicionesContrato = resCondicionesContrato.data;
  }

  if (
    resConceptos.data &&
    typeof resConceptos.data === 'object' &&
    'data' in resConceptos.data &&
    Array.isArray((resConceptos.data as any).data)
  ) {
    conceptos = (resConceptos.data as { data: Conceptos[] }).data;
  } else if (Array.isArray(resConceptos.data)) {
    conceptos = resConceptos.data;
  }

  return {
    condicionesContrato,
    conceptos,
  };
}

export default function CondicionesContrato({
  loaderData,
}: Route.ComponentProps) {
  const { condicionesContrato, conceptos } = loaderData;
  const pageBreadcrumbs = [
    { label: 'Administracion' },
    { label: 'Condiciones Contrato' },
  ];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CondicionesContratoComponent
        condicionesContrato={condicionesContrato}
        conceptos={conceptos}
      />
    </div>
  );
}
