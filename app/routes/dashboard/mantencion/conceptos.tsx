import React from 'react';
import type { Route } from './+types/conceptos';
import api from '~/lib/api';
import type { ComboAsociadoConceptos, Conceptos } from '~/types/mantencion';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import ConceptosComponent from '~/components/mantencion/conceptos/conceptos-component';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Conceptos' },
    { name: 'description', content: 'Gestión de Conceptos del sistema' },
  ];
}

export async function clientLoader() {
  try {
    const response = await api.get('/buscarConceptos');
    const resComboAsociadoConceptos = await api.get(
      '/combo-asociado-conoceptos',
    );

    // Manejar diferentes formatos de respuesta de la API
    let conceptos: Conceptos[] = [];
    let comboAsociadoConceptos: ComboAsociadoConceptos[] = [];

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data &&
      Array.isArray((response.data as any).data)
    ) {
      conceptos = (response.data as { data: Conceptos[] }).data;
    } else if (Array.isArray(response.data)) {
      conceptos = response.data;
    }

    // Procesar respuesta del combo asociado
    if (
      resComboAsociadoConceptos.data &&
      typeof resComboAsociadoConceptos.data === 'object' &&
      'data' in resComboAsociadoConceptos.data &&
      Array.isArray((resComboAsociadoConceptos.data as any).data)
    ) {
      comboAsociadoConceptos = (
        resComboAsociadoConceptos.data as { data: ComboAsociadoConceptos[] }
      ).data;
    } else if (Array.isArray(resComboAsociadoConceptos.data)) {
      comboAsociadoConceptos = resComboAsociadoConceptos.data;
    }

    return { conceptos, comboAsociadoConceptos };
  } catch (error) {
    console.error('Error al cargar conceptos:', error);
    throw new Response('Error al cargar los conceptos', { status: 500 });
  }
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
