/* eslint-disable no-empty-pattern */
import React from 'react';
import type { Route } from './+types/zonas';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { mantencionService } from '~/services/mantencionService';
import ZonasComponent from '~/components/mantencion/zonas/zonas-component';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Zonas' },
    { name: 'description', content: 'Gestión de zonas del sistema' },
  ];
}

export async function clientLoader() {
  const result = await mantencionService.getZonas();

  if (result.error || !result.data) {
    return { zonas: [] };
  }

  return { zonas: result.data };
}

export default function Zonas({ loaderData }: Route.ComponentProps) {
  const { zonas } = loaderData;

  const pageBreadcrumbs = [{ label: 'Mantención' }, { label: 'Zonas' }];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <ZonasComponent zonas={zonas} />
    </div>
  );
}
