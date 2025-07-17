/* eslint-disable no-empty-pattern */
import React from 'react';
import type { Route } from './+types/conceptos';
import { mantencionService } from '~/services/mantencionService';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import ConceptosComponent from '~/components/mantencion/conceptos/conceptos-component';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Conceptos' },
    { name: 'description', content: 'Gestión de Conceptos del sistema' },
  ];
}

export async function clientLoader() {
  const result = await mantencionService.getConceptosData();

  if (result.error || !result.data) {
    return {
      conceptos: [],
      comboAsociadoConceptos: []
    };
  }

  return result.data;
}

export default function Conceptos({ loaderData }: Route.ComponentProps) {
  const { conceptos, comboAsociadoConceptos } = loaderData;

  const pageBreadcrumbs = [{ label: 'Mantención' }, { label: 'Conceptos' }];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <ConceptosComponent
        conceptos={conceptos}
        comboAsociadoConceptos={comboAsociadoConceptos}
      />
    </div>
  );
}
