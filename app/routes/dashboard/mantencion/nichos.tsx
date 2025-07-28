/* eslint-disable no-empty-pattern */
import React from 'react';

import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import NichosComponent from '~/components/mantencion/nichos/nichos-component';
import { mantencionService } from '~/services/mantencionService';

import type { Route } from './+types/nichos';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Nichos' },
    { name: 'description', content: ' nichos del sistema' },
  ];
}

export async function clientLoader() {
  const result = await mantencionService.getNichos();

  if (result.error || !result.data) {
    return { nichos: [] };
  }

  return { nichos: result.data };
}

export default function Nichos({ loaderData }: Route.ComponentProps) {
  const { nichos } = loaderData;

  const pageBreadcrumbs = [{ label: 'Mantención' }, { label: 'Nichos' }];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <NichosComponent nichos={nichos} />
    </div>
  );
}
