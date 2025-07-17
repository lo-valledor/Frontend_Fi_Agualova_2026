/* eslint-disable no-empty-pattern */
import React from 'react';
import type { Route } from './+types/empalmes';
import EmpalmesComponent from '~/components/mantencion/empalmes/empalmes-component';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { mantencionService } from '~/services/mantencionService';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Empalmes' },
    { name: 'description', content: 'Gestión de empalmes del sistema' },
  ];
}

export async function clientLoader() {
  const result = await mantencionService.getEmpalmes();

  if (result.error || !result.data) {
    return { empalmes: [] };
  }

  return { empalmes: result.data };
}

export default function Empalmes({ loaderData }: Route.ComponentProps) {
  const { empalmes } = loaderData;

  const pageBreadcrumbs = [{ label: 'Mantención' }, { label: 'Empalmes' }];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <EmpalmesComponent empalmes={empalmes} />
    </div>
  );
}
