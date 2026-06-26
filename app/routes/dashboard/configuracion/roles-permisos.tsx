/* eslint-disable no-empty-pattern */
import { lazy, Suspense } from 'react';
import { useRevalidator } from 'react-router';

import { DataTableSkeleton } from '~/components/skeletons';
import { rolesPermisosService } from '~/services/rolesPermisosService';
import type { Permisos, Roles } from '~/types/roles-permisos';

import type { Route } from './+types/roles-permisos';

interface RolePermissionsEntry {
  roleId: string;
  permisos: Permisos[];
}

interface LoaderData {
  roles: Roles[];
  allPermissions: Permisos[];
  rolePermissions: RolePermissionsEntry[];
  error: Error | null;
}

// Lazy load del componente pesado (35 KB)
const RolesPermisosComponent = lazy(
  () =>
    import('~/components/configuracion/roles-permisos/roles-permisos-component')
);

export function meta(_args: Route.MetaArgs) {
  return [
    {
      title: 'Agualova | Roles y Permisos',
      description: 'Gestión de roles y permisos del sistema.'
    }
  ];
}

export async function clientLoader({}: Route.ClientLoaderArgs): Promise<LoaderData> {
  try {
    const [rolesResponse, permissionsResponse] = await Promise.all([
      rolesPermisosService.getAllRoles(),
      rolesPermisosService.getAllPermissions()
    ]);

    if (rolesResponse.error || permissionsResponse.error) {
      return {
        roles: [],
        allPermissions: [],
        rolePermissions: [],
        error: new Error(
          rolesResponse.error ||
            permissionsResponse.error ||
            'Error al cargar datos'
        )
      };
    }

    const roles = rolesResponse.data || [];
    const allPermissions = permissionsResponse.data || [];

    const rolePermissions =
      roles.length > 0
        ? await Promise.all(
            roles.map(async role => {
              const result = await rolesPermisosService.getRolePermissions(
                role.id
              );

              return {
                roleId: role.id,
                permisos: result.data || []
              };
            })
          )
        : [];

    const failedRolePermissions = rolePermissions.length !== roles.length;

    if (failedRolePermissions) {
      return {
        roles: [],
        allPermissions: [],
        rolePermissions: [],
        error: new Error('Error al cargar permisos por rol')
      };
    }

    return {
      roles,
      allPermissions,
      rolePermissions,
      error: null
    };
  } catch (error) {
    return {
      roles: [],
      allPermissions: [],
      rolePermissions: [],
      error: new Error(
        error instanceof Error ? error.message : 'Error desconocido'
      )
    };
  }
}

export default function RolesPermisos({ loaderData }: Route.ComponentProps) {
  const revalidator = useRevalidator();

  const handleDataChange = () => {
    revalidator.revalidate();
  };

  return (
    <Suspense fallback={<DataTableSkeleton columns={4} rows={8} />}>
      <RolesPermisosComponent
        roles={loaderData?.roles || []}
        allPermissions={loaderData?.allPermissions || []}
        rolePermissions={loaderData?.rolePermissions || []}
        error={loaderData?.error || null}
        onDataChange={handleDataChange}
      />
    </Suspense>
  );
}

export function hydrateFallback() {
  return <DataTableSkeleton columns={4} rows={8} />;
}
