/* eslint-disable no-empty-pattern */
import { lazy, Suspense } from 'react';

import { MonitorLecturasSkeleton } from '~/components/skeletons';
import { monitorService } from '~/services/monitorService';

import type { Route } from './+types/monitor-lecturas';

/**
 * Lazy-loaded MonitorLecturasComponent to optimize bundle size (183 KB)
 * Only loaded when the route is accessed, improving initial page load time
 */
const MonitorLecturasComponent = lazy(() =>
  import('~/components/monitor/monitor-lecturas-component')
);

/**
 * Hydration fallback component for SSR
 * Displays while the page is being hydrated on the client side
 *
 * @returns {JSX.Element} Loading skeleton UI
 * @example
 * // Automatically called by framework during hydration
 */
export function hydrateFallback() {
  return <MonitorLecturasSkeleton />;
}

/**
 * Meta tags for the Monitor de Lecturas page
 * Controls page title and meta description for SEO
 *
 * @param {Route.MetaArgs} _ - Route meta arguments (unused)
 * @returns {Array<{ title?: string; name?: string; content?: string }>}
 *   Meta tags array containing title and description
 *
 * @example
 * // SEO output
 * // <title>Enerlova | Monitor Lecturas</title>
 * // <meta name="description" content="Monitoreo de lecturas de medidores" />
 */
export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Monitor Lecturas' },
    { name: 'description', content: 'Monitoreo de lecturas de medidores' }
  ];
}

/**
 * Client-side loader for the Monitor de Lecturas page
 * Fetches initial data: periods, sectors, and reading codes
 * Handles errors gracefully by returning empty arrays
 *
 * @async
 * @returns {Promise<{
 *   periodos: Periodo[];
 *   sectores: Sector[];
 *   claves: Clave[];
 *   activePeriodoId: number | null;
 *   error: Error | null;
 * }>} Initial data for the component
 *
 * @throws {Error} Caught internally and returned as error property
 *
 * @example
 * // On success
 * {
 *   periodos: [{IdPeriodo: '1', DescripcionPeriodo: 'Enero 2025', ...}],
 *   sectores: [{sectorId: 'SEC1', descripcion: 'Centro', ...}],
 *   claves: [{IdClave: 1, DescripcionClave: 'Sin Lectura', ...}],
 *   activePeriodoId: 1,
 *   error: null
 * }
 *
 * @example
 * // On error - returns fallback values
 * {
 *   periodos: [],
 *   sectores: [],
 *   claves: [],
 *   activePeriodoId: null,
 *   error: Error('API connection failed')
 * }
 */
export async function clientLoader() {
  const result = await monitorService.getBasicData();

  if (result.error || !result.data) {
    return {
      periodos: [],
      sectores: [],
      claves: [],
      activePeriodoId: null,
      error: new Error(result.error || 'Error al cargar datos')
    };
  }

  return {
    periodos: result.data.periodos,
    sectores: result.data.sectores,
    claves: result.data.claves,
    activePeriodoId: result.data.activePeriodoId,
    error: null
  };
}

/**
 * Monitor de Lecturas Page Component
 * Main route component that renders the meter reading monitoring interface
 * Uses lazy loading and Suspense for performance optimization
 *
 * @component
 * @param {Route.ComponentProps} props - Component props from route
 * @param {object} props.loaderData - Data loaded by clientLoader
 * @param {Periodo[]} props.loaderData.periodos - Available billing periods
 * @param {Sector[]} props.loaderData.sectores - Available sectors
 * @param {Clave[]} props.loaderData.claves - Available reading codes/keys
 * @param {number | null} props.loaderData.activePeriodoId - Currently active period ID
 * @param {Error | null} props.loaderData.error - Loading error (if any)
 *
 * @returns {JSX.Element} Page layout with lazy-loaded component
 *
 * @example
 * // Route: /dashboard/monitor/monitor-lecturas
 * // Renders:
 * // <Suspense fallback={<MonitorLecturasSkeleton />}>
 * //   <MonitorLecturasComponent periodos={...} sectores={...} ... />
 * // </Suspense>
 */
export default function MonitorLecturasPage({
  loaderData
}: Route.ComponentProps) {
  return (
    <Suspense fallback={<MonitorLecturasSkeleton />}>
      <MonitorLecturasComponent {...loaderData} />
    </Suspense>
  );
}
