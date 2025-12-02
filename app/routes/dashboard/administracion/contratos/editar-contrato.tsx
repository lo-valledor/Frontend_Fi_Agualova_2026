import React from 'react';

import EditarContratoComponent from '~/components/administracion/contratos/route/editar-contrato-component';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { administracionService } from '~/services/administracionService';

export function meta() {
  return [
    { title: 'Enerlova | Contrato - Editar' },
    { name: 'description', content: 'Contrato - Editar' }
  ];
}

export async function clientLoader({ params }: { params: { id: string } }) {
  const result = await administracionService.getContratoById(Number(params.id));

  if (result.error || !result.data) {
    return {
      contrato: null,
      propietarios: [],
      locales: [],
      comunas: [],
      madres: [],
      clientes: []
    };
  }

  return {
    contrato: result.data.contrato,
    propietarios: result.data.propietarios,
    locales: result.data.locales,
    comunas: result.data.comunas,
    madres: result.data.madres,
    clientes: result.data.clientes
  };
}

export default function EditarContrato({
  loaderData
}: Readonly<{ loaderData: any }>) {
  const { contrato, propietarios, locales, comunas, madres, clientes } =
    loaderData;
  const pageBreadcrumbs = [{ label: 'Administracion' }, { label: 'Contratos' }];

  // Si no hay datos, mostrar mensaje de error o loading
  if (!contrato) {
    return (
      <div>
        <BreadcrumbSetter items={pageBreadcrumbs} />
        <div className='flex items-center justify-center p-8'>
          <p className='text-gray-500'>
            No se pudieron cargar los datos del contrato.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <EditarContratoComponent
        contrato={contrato}
        propietarios={propietarios}
        locales={locales}
        comunas={comunas}
        madres={madres}
        clientes={clientes}
      />
    </div>
  );
}
