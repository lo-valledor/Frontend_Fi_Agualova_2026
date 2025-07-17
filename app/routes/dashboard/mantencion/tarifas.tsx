/* eslint-disable no-empty-pattern */
import React from 'react';
import type { Route } from './+types/tarifas';
import { mantencionService } from '~/services/mantencionService';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import TarifasComponent from '~/components/mantencion/tarifas/tarifas-component';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Tarifas' },
    { name: 'description', content: 'Gestión de Tarifas del sistema' },
  ];
}

export async function clientLoader() {
  const result = await mantencionService.getTarifas();

  if (result.error || !result.data) {
    return { tarifas: [] };
  }

  return { tarifas: result.data };
}

export default function Tarifas({ loaderData }: Route.ComponentProps) {
  const { tarifas } = loaderData;

  const pageBreadcrumbs = [{ label: 'Mantención' }, { label: 'Tarifas' }];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <TarifasComponent tarifas={tarifas} />
    </div>
  );
}
