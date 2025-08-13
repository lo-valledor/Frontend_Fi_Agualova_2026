import React from 'react';
import CrearMedidorComponent from '~/components/administracion/medidores/form/crear-medidor-component';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { administracionService } from '~/services';

export function meta() {
  return [
    { title: 'Enerlova | Crear Medidor' },
    { name: 'description', content: 'Crear un nuevo medidor' }
  ];
}

export async function clientLoader() {
  const result = await administracionService.postMedidoresData();

  if (result.error || !result.data) {
    return {
      marca: [],
      tipoMedidor: []
    };
  }

  return result.data;
}

export default function CrearMedidor({
  loaderData
}: Readonly<{ loaderData: any }>) {
  const { marca, tipoMedidor } = loaderData;
  const pageBreadcrumbs = [{ label: 'Administracion' }, { label: 'Medidores' }];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CrearMedidorComponent marcas={marca} tipoMedidor={tipoMedidor} />
    </div>
  );
}
