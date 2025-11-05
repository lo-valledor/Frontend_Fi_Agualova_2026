import { useEffect, useState } from 'react';
import { rolesPermisosService } from '~/services/rolesPermisosService';
import type { PermisosUsuario } from '~/services/rolesPermisosService';
import { getAuthenticatedUser } from '~/utils/auth-utils';

interface UseUserPermissionsReturn {
  permissions: PermisosUsuario[];
  loading: boolean;
  error: string | null;
  hasPermission: (ruta: string) => boolean;
  canView: (ruta: string) => boolean;
  canCreate: (ruta: string) => boolean;
  canEdit: (ruta: string) => boolean;
  canDelete: (ruta: string) => boolean;
  refetch: () => Promise<void>;
}

export function useUserPermissions(): UseUserPermissionsReturn {
  const [permissions, setPermissions] = useState<PermisosUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      setError(null);

      const user = getAuthenticatedUser();
      if (!user || !user.id) {
        setPermissions([]);
        setError('Usuario no autenticado');
        return;
      }

      const response = await rolesPermisosService.getPermisosUsuario(user.id);

      if (response.error) {
        setError(response.error);
        setPermissions([]);
      } else {
        setPermissions(response.data || []);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al cargar permisos';
      setError(errorMessage);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const hasPermission = (ruta: string): boolean => {
    if (!ruta) return false;

    // Normalizar la ruta para comparación
    const normalizedRuta = ruta.startsWith('/') ? ruta : `/${ruta}`;

    const permission = permissions.find(p => p.ruta === normalizedRuta);
    return permission ? permission.puedeVer : false;
  };

  const canView = (ruta: string): boolean => {
    if (!ruta) return false;
    const normalizedRuta = ruta.startsWith('/') ? ruta : `/${ruta}`;
    const permission = permissions.find(p => p.ruta === normalizedRuta);
    return permission ? permission.puedeVer : false;
  };

  const canCreate = (ruta: string): boolean => {
    if (!ruta) return false;
    const normalizedRuta = ruta.startsWith('/') ? ruta : `/${ruta}`;
    const permission = permissions.find(p => p.ruta === normalizedRuta);
    return permission ? permission.puedeCrear : false;
  };

  const canEdit = (ruta: string): boolean => {
    if (!ruta) return false;
    const normalizedRuta = ruta.startsWith('/') ? ruta : `/${ruta}`;
    const permission = permissions.find(p => p.ruta === normalizedRuta);
    return permission ? permission.puedeEditar : false;
  };

  const canDelete = (ruta: string): boolean => {
    if (!ruta) return false;
    const normalizedRuta = ruta.startsWith('/') ? ruta : `/${ruta}`;
    const permission = permissions.find(p => p.ruta === normalizedRuta);
    return permission ? permission.puedeEliminar : false;
  };

  return {
    permissions,
    loading,
    error,
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canDelete,
    refetch: fetchPermissions
  };
}
