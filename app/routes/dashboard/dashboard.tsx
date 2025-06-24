/* eslint-disable no-empty-pattern */
import { useLoaderData } from 'react-router';
import type { Route } from './+types/dashboard';
import DashboardComponent from '~/components/dashboard/dashboard-component';
import api from '~/lib/api';
import type {
  PeriodoAbierto,
  TotalesCorteReposicion,
  ValidarSectoresPendientes,
} from '~/types/operaciones';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Inicio' },
    { name: 'description', content: 'Dashboard' },
  ];
}

export async function clientLoader() {
  const [periodoAbiertoRes, lecturasPendientesRes, corteRes] =
    await Promise.all([
      api.get('ConsultarPeriodoAbierto'),
      api.get('validar-lecturas-pendientes'),
      api.get('consulta-registros-revision'),
    ]);
  const periodoAbierto = periodoAbiertoRes.data as PeriodoAbierto;
  const lecturasPendientes =
    lecturasPendientesRes.data as ValidarSectoresPendientes;
  const corte = corteRes.data as TotalesCorteReposicion;
  return { periodoAbierto, lecturasPendientes, corte };
}

export default function DashboardPage() {
  const { periodoAbierto, lecturasPendientes, corte } =
    useLoaderData<typeof clientLoader>();
  return (
    <DashboardComponent
      periodoAbierto={periodoAbierto}
      lecturasPendientes={lecturasPendientes}
      corte={corte}
    />
  );
}
