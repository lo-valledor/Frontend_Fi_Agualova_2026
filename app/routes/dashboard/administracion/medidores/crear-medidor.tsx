import CrearMedidorComponent from '~/components/administracion/medidores/form/crear-medidor-component';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { administracionService } from '~/services/administracionService';

export function meta() {
  return [
    { title: 'Agualova | Crear Medidor' },
    { name: 'description', content: 'Crear un nuevo medidor' }
  ];
}

export async function clientLoader() {
  const result = await administracionService.getMedidoresData();

  if (result.error || !result.data) {
    return {
      marcas: [],
      tipos: [],
      estados: []
    };
  }

  return {
    marcas: result.data.marcas,
    tipos: result.data.tipos,
    estados: result.data.estados
  };
}

interface LoaderData {
  marcas: Awaited<ReturnType<typeof clientLoader>>['marcas'];
  tipos: Awaited<ReturnType<typeof clientLoader>>['tipos'];
  estados: Awaited<ReturnType<typeof clientLoader>>['estados'];
}

export default function CrearMedidor({
  loaderData
}: Readonly<{ loaderData: LoaderData }>) {
  const pageBreadcrumbs = [{ label: 'Administracion' }, { label: 'Medidores' }];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CrearMedidorComponent
        marcas={loaderData.marcas}
        tipos={loaderData.tipos}
        estados={loaderData.estados}
      />
    </div>
  );
}
