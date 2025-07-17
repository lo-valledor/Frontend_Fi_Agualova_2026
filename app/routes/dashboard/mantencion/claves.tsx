/* eslint-disable no-empty-pattern */
import React from 'react';
import type { Route } from './+types/claves';
import { mantencionService } from '~/services/mantencionService';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import ClavesComponent from '~/components/mantencion/claves/claves-component';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Claves' },
    { name: 'description', content: 'Gestión de claves del sistema' },
  ];
}

export async function clientLoader() {
  const result = await mantencionService.getClaves();

  if (result.error || !result.data) {
    return { claves: [] };
  }

  return { claves: result.data };
}

export default function Claves({ loaderData }: Route.ComponentProps) {
  const { claves } = loaderData;

  const pageBreadcrumbs = [{ label: 'Mantención' }, { label: 'Claves' }];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <ClavesComponent claves={claves} />
    </div>
  );
}
