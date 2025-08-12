import React from 'react';

import CrearContratoComponent from '~/components/administracion/contratos/route/crear-contrato-component';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { administracionService } from '~/services';

export function meta() {
  return [
    { title: 'Enerlova | Crear Contrato' },
    { name: 'description', content: 'Crear un nuevo contrato' }
  ];
}

export async function clientLoader() {
  const result = await administracionService.getDataCreacionContrato();

  if (result.error || !result.data) {
    return {
      propietarios: [],
      locales: [],
      comunas: [],
      madres: [],
      clientes: []
    };
  }

  return result.data;
}

export default function CrearContrato({
  loaderData
}: Readonly<{ loaderData: any }>) {
  const { propietarios, locales, comunas, madres, clientes } = loaderData;
  const pageBreadcrumbs = [{ label: 'Administracion' }, { label: 'Contratos' }];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CrearContratoComponent
        propietarios={propietarios}
        locales={locales}
        comunas={comunas}
        madres={madres}
        clientes={clientes}
      />
    </div>
  );
}
