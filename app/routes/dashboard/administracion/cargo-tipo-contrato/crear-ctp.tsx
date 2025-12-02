import React from 'react';
import CrearTipoContratoComponent from '~/components/administracion/cargo-tipo-contrato/form/crear-tipo-contrato-component';

import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { administracionService } from '~/services/administracionService';
import { mantencionService } from '~/services/mantencionService';

export function meta() {
  return [
    { title: 'Enerlova | Crear Cargo Tipo Contrato' },
    { name: 'description', content: 'Crear un nuevo cargo tipo contrato' }
  ];
}

export async function clientLoader() {
  const [resultCargos, resultTiposContratos] = await Promise.all([
    administracionService.getCargoTipoContratoCrear(),
    mantencionService.getTiposContratos()
  ]);

  if (resultCargos.error || !resultCargos.data) {
    return {
      conceptos: [],
      tarifas: [],
      tiposMedidor: [],
      condicionesContrato: [],
      cargos: [],
      tiposContratos: resultTiposContratos.data || []
    };
  }

  return {
    ...resultCargos.data,
    tiposContratos: resultTiposContratos.data || []
  };
}

export default function CrearCtp({
  loaderData
}: Readonly<{ loaderData: any }>) {
  const {
    conceptos,
    tarifas,
    tiposMedidor,
    condicionesContrato,
    cargos,
    tiposContratos
  } = loaderData;
  const pageBreadcrumbs = [
    { label: 'Administracion' },
    { label: 'Cargo Tipo Contrato' }
  ];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CrearTipoContratoComponent
        conceptos={conceptos}
        tarifas={tarifas}
        tiposMedidor={tiposMedidor}
        condicionesContrato={condicionesContrato}
        cargos={cargos}
        tiposContratos={tiposContratos}
      />
    </div>
  );
}
