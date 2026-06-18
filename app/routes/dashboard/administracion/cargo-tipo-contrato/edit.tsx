import EditarTipoContrato from '~/components/administracion/cargo-tipo-contrato/form/editar-tipo-contrato';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { administracionService } from '~/services/administracionService';

import type { Route } from './+types/edit';

export function meta() {
  return [
    { title: 'Agualova | Cargo Tipo Contrato - Editar' },
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

export default function Edit({ loaderData }: Route.ComponentProps) {
  const { cargoTipoContrato } = loaderData;
  const pageBreadcrumbs = [
    { label: 'Administracion' },
    { label: 'Cargo Tipo Contrato' }
  ];

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
        tipoContratoId={cargoTipoContrato.tipoContratoId}
        tipoContrato={cargoTipoContrato.tipoContrato}
        configuracion={cargoTipoContrato.configuracion}
        conceptos={cargoTipoContrato.conceptos}
        condiciones={cargoTipoContrato.condiciones}
        cargosFacturables={cargoTipoContrato.cargosFacturables}
      />
    </div>
  );
}
