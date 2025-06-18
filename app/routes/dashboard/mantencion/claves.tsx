import React from 'react';
import type { Route } from './+types/claves';
import api from '~/lib/api';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import ClavesComponent from '~/components/mantencion/claves/claves-component';
import type { Claves } from '~/types/mantencion';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Claves' },
    { name: 'description', content: 'Claves' },
  ];
}

export async function clientLoader() {
  const res = await api.get('/buscarClaves');
  return {
    claves: res.data as Claves[],
  };
}

export default function Claves({ loaderData }: Route.ComponentProps) {
  const { claves } = loaderData;
  const pageBreadcrumbs = [{ label: 'Mantencion' }, { label: 'Claves' }];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <ClavesComponent claves={claves} />
    </div>
  );
}
