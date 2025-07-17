/* eslint-disable no-empty-pattern */
import React from 'react';
import type { Route } from './+types/sector';
import { mantencionService } from '~/services/mantencionService';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import SectorComponent from '~/components/mantencion/sector/sector-component';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Sectores' },
    { name: 'description', content: 'Gestión de sectores del sistema' },
  ];
}

export async function clientLoader() {
  const result = await mantencionService.getSectores();

  if (result.error || !result.data) {
    return { sectores: [] };
  }

  return { sectores: result.data };
}

export default function Sector({ loaderData }: Route.ComponentProps) {
  const { sectores } = loaderData;

  const pageBreadcrumbs = [{ label: 'Mantención' }, { label: 'Sectores' }];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <SectorComponent sectores={sectores} />
    </div>
  );
}
