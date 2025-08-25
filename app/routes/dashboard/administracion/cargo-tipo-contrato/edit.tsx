/* eslint-disable no-empty-pattern */
import EditarTipoContrato from '~/components/administracion/cargo-tipo-contrato/form/editar-tipo-contrato';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { administracionService } from '~/services/administracionService';
import type {
  BuscarCargoFacturable,
  GeCombosConceptos,
  GetCombosTarifas,
  GetCombosTiposMedidor,
  GetCondicionesContrato
} from '~/types/administracion';

import type { Route } from './+types/edit';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Cargo Tipo Contrato - Editar' },
    { name: 'description', content: 'Cargo Tipo Contrato - Editar' }
  ];
}

export async function clientLoader({ params }: Route.ClientActionArgs) {
  const result = await administracionService.getCargoTipoContratoById(
    Number(params.cargoTipoContratoId)
  );

  if (result.error || !result.data) {
    return { cargoTipoContrato: null };
  }

  return { cargoTipoContrato: result.data };
}

export default function Edit({ loaderData, params }: Route.ComponentProps) {
  const { cargoTipoContrato } = loaderData;
  const pageBreadcrumbs = [
    { label: 'Administracion' },
    { label: 'Cargo Tipo Contrato' }
  ];

  // Si no hay datos, mostrar mensaje de error o loading
  if (!cargoTipoContrato) {
    return (
      <div>
        <BreadcrumbSetter items={pageBreadcrumbs} />
        <div className='flex items-center justify-center p-8'>
          <p className='text-gray-500'>
            No se pudieron cargar los datos del cargo tipo contrato.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <EditarTipoContrato
        cargoTipoContrato={cargoTipoContrato.editar}
        detalle={cargoTipoContrato.detalle}
        listbox={cargoTipoContrato.listbox}
        conceptos={
          cargoTipoContrato.conceptos as unknown as GeCombosConceptos[]
        }
        tarifas={cargoTipoContrato.tarifas as unknown as GetCombosTarifas[]}
        tiposMedidor={
          cargoTipoContrato.tiposMedidor as unknown as GetCombosTiposMedidor[]
        }
        condicionesContrato={
          cargoTipoContrato.condicionesContrato as unknown as GetCondicionesContrato[]
        }
        cargos={cargoTipoContrato.cargos as unknown as BuscarCargoFacturable[]}
        tipoContratoId={Number(params.cargoTipoContratoId)}
      />
    </div>
  );
}
