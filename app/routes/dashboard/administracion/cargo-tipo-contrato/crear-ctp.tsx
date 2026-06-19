import CrearTipoContratoComponent from '~/components/administracion/cargo-tipo-contrato/form/crear-tipo-contrato-component';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { administracionService } from '~/services/administracionService';

export function meta() {
  return [
    { title: 'Agualova | Crear Cargo Tipo Contrato' },
    {
      name: 'description',
      content: 'Crear una nueva configuración de cargo tipo contrato'
    }
  ];
}

export async function clientLoader() {
  const result = await administracionService.getCargoTipoContratoCrear();

  if (result.error || !result.data) {
    return {
      tiposContrato: [],
      conceptos: [],
      condiciones: [],
      cargosFacturables: []
    };
  }

  return result.data;
}

export default function CrearCtp({
  loaderData
}: Readonly<{ loaderData: Awaited<ReturnType<typeof clientLoader>> }>) {
  const pageBreadcrumbs = [
    { label: 'Administracion' },
    { label: 'Cargo Tipo Contrato' }
  ];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CrearTipoContratoComponent
        tiposContrato={loaderData.tiposContrato}
        conceptos={loaderData.conceptos}
        condiciones={loaderData.condiciones}
        cargosFacturables={loaderData.cargosFacturables}
      />
    </div>
  );
}
