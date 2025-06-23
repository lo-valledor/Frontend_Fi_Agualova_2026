// eslint-disable no-empty-pattern
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import PrepararLecturasComponent from '~/components/operaciones/preparar-lecturas/preparar-lecturas-component';
import type { Route } from './+types/preparar-lecturas';
import api from '~/lib/api';
import type {
  PeriodoAbierto,
  ValidarSectoresPendientes,
  ConsultarSectores,
  OpcionesPrepararLecturas,
} from '~/types/operaciones';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Preparar Lecturas' },
    { name: 'description', content: 'Preparar Lecturas' },
  ];
}

export async function clientLoader() {
  try {
    const [periodoAbierto, lecturasPendientes, sectores, opcionesPreparar] =
      await Promise.all([
        api.get('/ConsultarPeriodoAbierto'),
        api.get('/validar-lecturas-pendientes'),
        api.get('/consultar-sectores'),
        api.get('/opciones-preparar-lecturas', { params: { control: '1' } }),
      ]);

    return {
      periodoAbierto: periodoAbierto.data as PeriodoAbierto[],
      lecturasPendientes: lecturasPendientes.data as ValidarSectoresPendientes,
      sectores: sectores.data as ConsultarSectores[],
      opcionesPreparar: opcionesPreparar.data as OpcionesPrepararLecturas[],
    };
  } catch (error) {
    console.error('Error en clientLoader:', error);
    return {
      periodoAbierto: null,
      lecturasPendientes: null,
      sectores: null,
      opcionesPreparar: null,
    };
  }
}

export default function PrepararLecturas({ loaderData }: Route.ComponentProps) {
  const { periodoAbierto, lecturasPendientes, sectores, opcionesPreparar } =
    loaderData;
  const pageBreadcrumbs = [
    { label: 'Operaciones' },
    { label: 'Preparar Lecturas' },
  ];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <PrepararLecturasComponent
        periodoAbierto={periodoAbierto ?? []}
        lecturasPendientes={lecturasPendientes}
        sectores={sectores ?? []}
        opcionesPreparar={opcionesPreparar ?? []}
      />
    </div>
  );
}
