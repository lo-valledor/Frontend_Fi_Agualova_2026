/* eslint-disable no-empty-pattern */
import React from 'react';
import MedidoresComponent from '~/components/administracion/medidores/medidores-component';
import type { Route } from './+types/medidores';
import { administracionService } from '~/services/administracionService';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Medidores' },
    { name: 'description', content: 'Medidores' },
  ];
}

export async function clientLoader() {
  const result = await administracionService.getMedidoresData();

  if (result.error || !result.data) {
    return {
      medidores: [],
      marcas: [],
    };
  }

  return result.data;
}

export default function Medidores({ loaderData }: Route.ComponentProps) {
  const { medidores, marcas } = loaderData;
  const pageBreadcrumbs = [{ label: 'Administracion' }, { label: 'Medidores' }];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <MedidoresComponent medidores={medidores} marcas={marcas} />
    </div>
  );
}
